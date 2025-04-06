"use strict";
const { Model } = require("sequelize");
const PROTECTED_ATTRIBUTES = ["password"];
const sequelizePaginate = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		toJSON() {
			// hide protected fields
			let attributes = Object.assign({}, this.get());
			for (let a of PROTECTED_ATTRIBUTES) {
				delete attributes[a];
			}
			return attributes;
		}

		static associate(models) {
			User.hasOne(models.Store, {
				foreignKey: "ownUserId",
				as: "storeOwner",
			});
			User.hasOne(models.Staff, {
				foreignKey: "userId",
				constraints: false,
				as: "staff",
			});
            User.hasMany(models.Transaction, {
                foreignKey: "forUserId",
                as: "transactions"
            });
            User.hasMany(models.Notification, {
                foreignKey: "toUserId",
                as: "notifications"
            });
            User.hasMany(models.CustomerAddress, {
                foreignKey: "customerUserId",
                as: "addresses"
            });
		}
	}
	User.init(
		{
			userName: DataTypes.TEXT,
			email: DataTypes.TEXT,
			password: DataTypes.TEXT,
			urlImage: DataTypes.TEXT,
            role: DataTypes.INTEGER,
			active: DataTypes.BOOLEAN,
			phone: DataTypes.STRING,
			totalMoney: {
				type: DataTypes.DOUBLE,
				defaultValue: 0,
			},
			userCoordinate: DataTypes.GEOMETRY("POINT"),
			gender: DataTypes.INTEGER,
			chatBoxUpdatedAt: { type: DataTypes.DATE, defaultValue: new Date() },
			unreadMessageCount: { type: DataTypes.INTEGER, defaultValue: 0 },
            resetKey: DataTypes.TEXT,
            resetKeyExpiredAt: DataTypes.DATE,
            createdAt: DataTypes.DATE,
			updatedAt: DataTypes.DATE,
		},
		{
			sequelize,
			modelName: "User",
		},
	);
	sequelizePaginate.paginate(User);
	return User;
};
