"use strict";
const { Model } = require("sequelize");
const sequelizePaginate = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
    class OrderForwarder extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */

        static associate(models) {

        }
    }
    OrderForwarder.init(
        {
            staffId: DataTypes.INTEGER,
            orderId: DataTypes.INTEGER,
            isAccept: DataTypes.BOOLEAN,
            status: DataTypes.INTEGER,
            storeId: DataTypes.INTEGER,
            expiredAt: DataTypes.DATE,
            timerTime: DataTypes.DATE,
            type: DataTypes.INTEGER,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: "OrderForwarder",
        },
    );
    sequelizePaginate.paginate(OrderForwarder);
    return OrderForwarder;
};
