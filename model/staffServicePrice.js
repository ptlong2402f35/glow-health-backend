"use strict";
const { Model } = require("sequelize");
const sequelizePaginate = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
    class StaffServicePrice extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */

        static associate(models) {
            StaffServicePrice.belongsTo(models.StaffService, {
                foreignKey: "staffServiceId",
                as: "staffService"
            });
            StaffServicePrice.belongsToMany(models.Order, {
                through: "OrderPrices",
				foreignKey: "staffServicePriceId",
				as: "orders",
			});
        }
    }
    StaffServicePrice.init(
        {
            staffServiceId: DataTypes.INTEGER,
            price: DataTypes.DOUBLE,
            unit: DataTypes.TEXT,
            serviceGroupId: DataTypes.INTEGER,
            staffId: DataTypes.INTEGER,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: "StaffServicePrice",
        },
    );
    sequelizePaginate.paginate(StaffServicePrice);
    return StaffServicePrice;
};
