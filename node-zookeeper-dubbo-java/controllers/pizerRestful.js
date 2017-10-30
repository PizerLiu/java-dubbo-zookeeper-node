
const pizerDao = require('../lib/pizerDao');
const responseUtils = require('../common/responseUtils');

module.exports = {
    'POST /api/pizer': async (ctx) => {
        let response = await pizerDao.pizer.OutString("hahahahhaha");

        responseUtils.success(ctx.response, response);
    }
}