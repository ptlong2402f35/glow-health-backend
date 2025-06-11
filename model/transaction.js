"use strict";
const { Model } = require("sequelize");
const sequelizePaginate = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
    class Transaction extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */

        static associate(models) {
            Transaction.belongsTo(models.User, {
				foreignKey: "forUserId",
				as: "user",
			}); 
        }
    }
    Transaction.init(
        {
            code: DataTypes.TEXT,
            forUserId: DataTypes.INTEGER,
            status: DataTypes.INTEGER,
            content: DataTypes.TEXT,
            orderId: DataTypes.INTEGER,
            money: DataTypes.DOUBLE,
            totalMoney: DataTypes.DOUBLE,
            userCreate: DataTypes.INTEGER,
            success: DataTypes.BOOLEAN,
            add: DataTypes.BOOLEAN,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: "Transaction",
        },
    );
    sequelizePaginate.paginate(Transaction);
    return Transaction;
};
