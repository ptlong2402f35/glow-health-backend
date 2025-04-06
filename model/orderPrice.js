"use strict";
const { Model } = require("sequelize");
const sequelizePaginate = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
    class OrderPrice extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */

        static associate(models) {
            OrderPrice.belongsTo(models.Order, {
                foreignKey: "orderId",
                as: "order"
            });
            OrderPrice.belongsTo(models.StaffServicePrice, {
                foreignKey: "staffServicePriceId",
                as: "price"
            });
        }
    }
    OrderPrice.init(
        {
            orderId: DataTypes.INTEGER,
            staffServicePriceId: DataTypes.INTEGER,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: "OrderPrice",
        },
    );
    sequelizePaginate.paginate(OrderPrice);
    return OrderPrice;
};
