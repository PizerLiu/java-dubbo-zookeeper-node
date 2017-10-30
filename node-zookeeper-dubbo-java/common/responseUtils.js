
module.exports = {
    paramError9: function (code, msg) {
        let err = new Error(msg);
        err.status = code;
        throw err;
    },
    paramError: function (response, msg) {
        let err = new Error(msg);
        err.status = 422;
        throw err;
    },
    failure: function (response, msg) {
        let err = new Error(msg);
        err.status = 500;
        throw err;
    },
    notFound: function (response, msg) {
        let err = new Error();
        err.status = 404;
        throw err;
    },
    success: function (response, data, msg) {
        response.body = arguments.length === 3 ? {
            "code": 200,
            "data": data,
            "msg": msg
        } : arguments.length === 2 ? {
            "code": 200,
            "data": data
        } : {
            "code": 200
        }
    }
};