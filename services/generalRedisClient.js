const redis = require("redis");
const createClient = redis.createClient;

const RedisHost = process.env.REDIS_HOST || "redis-14071.crce178.ap-east-1-1.ec2.redns.redis-cloud.com";
const RedisPort = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 14071;
const RedisUser = process.env.REDIS_USER || "default";
const RedisPassword = process.env.REDIS_PASS || "5o72ORrc1AozR1WUn9cFYYbtOYi5QBT6";

async function createRedisClient() {
	console.log(`node-redis version is ${require("redis/package.json").version}`);
	let client = createClient({
		username: RedisUser,
		password: RedisPassword,
		socket: {
			host: RedisHost,
			port: RedisPort
		}
	});
	client.on("error", err => console.log("Redis Client Error", err));
	await client.connect();

	return client;
}

class GeneralRedisClient {
	static instance;
	rawClient;
	initPromise;

	constructor() {
		//empty
	}

	getInstance() {
		if (!GeneralRedisClient.instance) {
			GeneralRedisClient.instance = new GeneralRedisClient();
		}
		return GeneralRedisClient.instance;
	}

	async getClient() {
		if(!this.initPromise) {
			let prom = async () => {
				this.rawClient = await createRedisClient();
				console.log(`[GeneralRedisClient] inited successfully`);
				return this.rawClient;
			};
			this.initPromise = prom();
		}
		return (await this.initPromise);
	}

	async getClient_() {
		if (!this.rawClient) {
			this.rawClient = await createRedisClient();
			console.log(`[GeneralRedisClient] inited successfully`);
		}
		return this.rawClient;
	}

	async disconnect() {
		if(this.rawClient) {
			try {
				if(this.rawClient.isOpen) {
					await this.rawClient.disconnect();
					console.log(`[GeneralRedisClient] stopped`);
				}
			}
			catch(err) {
				console.error(err);
			}
		}
	}
}

module.exports = {
	GeneralRedisClient,
	createRedisClient
}