const koa = require('koa');
const router = require('koa-router')();
const bodyParser = require('koa-bodyparser');
const json = require('koa-json');
const fs = require("fs");
const cors = require('koa-cors');
const serve = require('koa-static');
const Log4js = require('./common/Log4js');

const app = new koa();
app.use(bodyParser({
    enableTypes: ['json', 'form', 'text'],
    extendTypes: {
        text: ['x-' +
        'application/hessian'],
    }
}));

app.use(cors({credentials: true}));

app.use(async (ctx, next) => {
    const start = new Date();
    try {
        await next(ctx, next);
        if (ctx.response["__type"] === undefined) {
            if (ctx.response.status === 200) {
                ctx.response.body["t"] = new Date() - start;
            }
        }
    } catch (err) {
        if (ctx.response["__type"] === undefined) {

            Log4js.error(
                ctx.path +
                JSON.stringify(ctx.request.body) +
                JSON.stringify(ctx.request.headers.authentication),
                err.message);


            ctx.response.body = {
                code: err.status || 500,
                msg: err.message,
                t: new Date() - start
            };
            ctx.app.emit('error', err, this)
        }
    }
});

//scan controlloer js
let files = fs.readdirSync(__dirname + '/controllers');
let js_files = files.filter((f) => {
    return f.endsWith('.js');
});

let path;
for (let f of js_files) {
    console.log(`process controller: ${f}...`);
    let mapping = require(__dirname + '/controllers/' + f);
    for (let url in mapping) {
        if (url.startsWith('GET ')) {
            // 如果url类似"GET xxx":
            path = url.substring(4);
            router.get(path, mapping[url]);
            console.log(`register URL mapping: GET ${path}`);
        } else if (url.startsWith('POST ')) {
            // 如果url类似"POST xxx":
            path = url.substring(5);
            router.post(path, mapping[url]);
            console.log(`register URL mapping: POST ${path}`);
        } else if (url.startsWith('PUT ')) {
            // 如果url类似"PUT xxx":
            path = url.substring(4);
            router.put(path, mapping[url]);
            console.log(`register URL mapping: PUT ${path}`);
        } else if (url.startsWith('DELETE ')) {
            // 如果url类似"DELETE xxx":
            path = url.substring(7);
            router.delete(path, mapping[url]);
            console.log(`register URL mapping: DELETE ${path}`);
        } else {
            // 无效的URL:
            console.log(`invalid URL: ${url}`);
        }
    }
}


app.use(router.routes());
app.use(json());
app.listen(5000);
console.log('ask900 started at port 5000...');
module.exports = app;