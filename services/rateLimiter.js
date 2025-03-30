const { GeneralRedisClient } = require("./generalRedisClient");
const ExpiredRateLimiterTimer = process.env.EXPIRED_RATE_LIMITER_TIMER ? parseInt(process.env.EXPIRED_RATE_LIMITER_TIMER) : 5;
const REDIS_DISCONNECT_EXCEPTION = "REDIS_DISCONNECT_EXCEPTION";

class RateLimiter {
    redisClient;
    constructor(prefix) {
        this.prefix = prefix;
        this.redisClient = new GeneralRedisClient().getInstance();
    }

    async exec(requestId) {
        try {
            let check = await this.checkLimit(requestId);
            if(!check) {
                await this.updateLimit(requestId);
                return ({
                    allow: false,
                });
            }

            await this.updateLimit(requestId);

            return ({
                allow: true
            })
        }
        catch (err) {
            console.error(err);
			//bypass mode
			if (err === REDIS_DISCONNECT_EXCEPTION) {
				console.log(`==== [RateLimiter] Cache disconnected. Bypass run with id: ${requestIdentify}`);
			}
            return ({
                allow: true
            });
        }
    }

    async checkLimit(requestId) {
        try {
            let key = this.buildKey(requestId);
            let client = await this.redisClient.getClient();
            let data = await client.GET(key);
            if(!data || data <= 20) return true;
            return false;
        }
        catch (err) {
            console.error(err);
        }
    }

    async updateLimit(requestId) {
        try {
            let key = this.buildKey(requestId);
            let client = await this.redisClient.getClient();
            await client.INCR(key);
            await client.EXPIRE(key, ExpiredRateLimiterTimer);
        }
        catch (err) {
            console.error(err);
        }
    }

    buildKey(requestId) {
        return `${this.prefix}-limit-request:${requestId}`;
    }

}

class LoginLimiter {
    constructor() {
        this.prefix = "login";
        this.rateLimiter = new RateLimiter(this.prefix);
    }

    async exec(ip) {
        if(!ip) return {allow: false};
        return await this.rateLimiter.exec(ip);
    }
}

module.exports = {
    RateLimiter,
    LoginLimiter
}