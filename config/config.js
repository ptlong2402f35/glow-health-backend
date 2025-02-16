require("dotenv").config();

const MaxConnection = process.env.PROD_DB_MAX_CONNECTION ? parseInt(process.env.PROD_DB_MAX_CONNECTION) : 5;

module.exports = {
	development: {
		username: process.env.DEV_DB_USERNAME,
		password: process.env.DEV_DB_PASSWORD,
		database: process.env.DEV_DB,
		host: process.env.DEV_DB_HOST,
		dialect: process.env.DEV_DB_DIALECT,
		port: process.env.DEV_DB_PORT,
		dialectModule: require('pg'),
		logging: false,
		dialectOptions: {
			ssl: {
			  require: true,
			  rejectUnauthorized: false,
			},
		  },
	},
	staging: {
		username: process.env.DEV_DB_USERNAME,
		password: process.env.DEV_DB_PASSWORD,
		database: process.env.DEV_DB,
		host: process.env.DEV_DB_HOST,
		dialect: process.env.DEV_DB_DIALECT,
		port: process.env.DEV_DB_PORT,
		dialectModule: require('pg'),
		logging: false,
		dialectOptions: {
			ssl: {
			  require: true,
			  rejectUnauthorized: false,
			},
		  },
	},
	production: {
		username: process.env.PROD_DB_USERNAME,
		password: process.env.PROD_DB_PASSWORD,
		database: process.env.PROD_DB,
		host: process.env.PROD_DB_HOST,
		dialect: process.env.PROD_DB_DIALECT,
		port: process.env.PROD_DB_PORT,
		logging: false,
		pool: { max: MaxConnection },
		dialectOptions: {
			ssl: {
			  require: true,
			  rejectUnauthorized: false,
			},
		  },
	},
};
