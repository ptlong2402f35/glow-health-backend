const { LoginLimiter } = require("./rateLimiter");

class Middleware {
    constructor() {}
    async loginLimit(req, res, next) {
        try {
            let ip = req?.headers?.["x-forwarded-for"] || req?.connection?.remoteAddress;
            let {allow} = await new LoginLimiter().exec(ip);
            if(allow) {
                console.log(`xxx ${new Date().toISOString()} accept login for ip ${ip}`);
                next();
            }
            else {
                return res.status(429).json({message: "Server busy"});
            }
        }
        catch (err) {
            console.error(err);
            next();
        }
    }
}

module.exports = new Middleware();