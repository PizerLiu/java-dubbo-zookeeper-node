
const nzd = require('node-zookeeper-dubbo');
const java2js = require('js-to-java');
const __ZOOKEEPER_SERVER = process.env.ZOOKEEPER_SERVER || 'Zookeeper.Environment';

const opt = {
    application: {name: 'pizer'},
    register: `${__ZOOKEEPER_SERVER}:2181`,
    dubboVer: '2.5.6',
    root: 'dubbo',
    dependencies: {
        ExampleTestService: {interface: 'pizer.Service.ExampleTestService', timeout: 6000},
    }
}

try{
    const Dubbo = new nzd(opt);
}catch (err){
    console.log("err===="+err)
    if( err.indexOf("Create consumer node failed") != -1  ){
        //重启node容器
        child_process.spawn('node', [__dirname+'/timer/xzx.js']);
    }
}


module.exports = {
    pizer: {
        OutString: async (a) => Dubbo.ExampleTestService.OutString(
            java2js.String(a)
        )
    },
}