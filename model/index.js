"use strict";
require("dotenv").config();
const util = require("util");

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const endpoint = process.env.DEV_ENPOINT_ID;
const config = require(__dirname + "/../config/config.js")[env];
const db = {};

console.log(config);
let sequelize;

let DB_PASSWORD = decodeURIComponent(config.password);

sequelize = new Sequelize(config.database, config.username, DB_PASSWORD, {
	...config,
	dialectOptions: {
		ssl: {
		  require: true,
		  rejectUnauthorized: false,
		},
	  },
	// logging: console.log,
});
// console.log(`==== sequelize detail: `, util.inspect(sequelize, false, null, true));

fs.readdirSync(__dirname)
	.filter(file => {
		return file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js";
	})
	.forEach(file => {
		const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
		db[model.name] = model;
	});

Object.keys(db).forEach(modelName => {
	if (db[modelName].associate) {
		db[modelName].associate(db);
	}
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
