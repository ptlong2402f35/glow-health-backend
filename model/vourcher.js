"use strict";
const { Model } = require("sequelize");
const sequelizePaginate = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
    class Voucher extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */

        static associate(models) {

        }
    }
    Voucher.init(
        {
            code: DataTypes.TEXT,
            reduceValue: DataTypes.DOUBLE,
            reducePercent: DataTypes.DOUBLE,
            startAt: DataTypes.DATE,
            endAt: DataTypes.DATE,
            status: DataTypes.INTEGER,
            scope: DataTypes.INTEGER,
            staffId: DataTypes.INTEGER,
            storeId: DataTypes.INTEGER,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: "Voucher",
        },
    );
    sequelizePaginate.paginate(Voucher);
    return Voucher;
};
