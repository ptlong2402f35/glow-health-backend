"use strict";
const { Model } = require("sequelize");
const sequelizePaginate = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
    class Review extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */

        static associate(models) {

        }
    }
    Review.init(
        {
            staffId: DataTypes.INTEGER,
            orderId: DataTypes.INTEGER,
            customerUserId: DataTypes.INTEGER,
            status: DataTypes.INTEGER,
            staffServiceId: DataTypes.INTEGER,
            rate: DataTypes.INTEGER,
            note: DataTypes.INTEGER,
            storeId: DataTypes.INTEGER,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: "Review",
        },
    );
    sequelizePaginate.paginate(Review);
    return Review;
};
