const log4js = require('log4js');
const AMap = require('./AMap');
log4js.layouts.addLayout('json', function (config) {
    function layout(data) {
        let message = "", class_name = "", count = 0;
        if (data.data.length > 0) {
            message = data.data[0].message;
            class_name = data.data[0].class_name;
            count = data.data[0].count;
        }
        return JSON.stringify({
            "timestamp": data.startTime,
            "log_level": data.level.levelStr,
            "line_number": 0,
            "class_name": class_name,
            "message": message,
            "count": count
        });
    }

    return layout
});
log4js.configure({
    appenders: [
        {
            type: 'console',
            layout: {
                type: 'json',
            }
        },
        {
            type: 'file', filename: './pizer.log', category: 'cheese',
            layout: {
                type: 'json',
            }
        }
    ]
});
let logger = log4js.getLogger('cheese');
logger.setLevel('ERROR');
module.exports = {
    error: function (class_name, message) {
        const uuid = `error${class_name}`;
        if (AMap.set(uuid)) {
            logger.error({
                class_name: class_name,
                message: message,
                count: AMap.count(uuid, 0)
            });
        }
    },
    fatal: function (class_name, message) {
        const uuid = `fatal${class_name}`;
        if (AMap.set(uuid)) {
            logger.fatal({
                class_name: class_name,
                message: message,
                count: AMap.count(uuid, 0)
            });
        }
    }
};