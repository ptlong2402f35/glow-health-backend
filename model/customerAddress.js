"use strict";
const { Model } = require("sequelize");
const sequelizePaginate = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
    class CustomerAddress extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */

        static associate(models) {
            CustomerAddress.belongsTo(models.User, {
				foreignKey: "customerUserId",
				as: "addresses",
			});
        }
    }
    CustomerAddress.init(
        {
            customerName: DataTypes.TEXT,
            phone: DataTypes.TEXT,
            default: DataTypes.BOOLEAN,
            active: DataTypes.BOOLEAN,
            customerUserId: DataTypes.INTEGER,
            provinceId: DataTypes.INTEGER,
            districtId: DataTypes.INTEGER,
            communeId: DataTypes.INTEGER,
            address: DataTypes.TEXT,
            lat: DataTypes.INTEGER,
            long: DataTypes.INTEGER,
            note: DataTypes.TEXT,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: "CustomerAddress",
        },
    );
    sequelizePaginate.paginate(CustomerAddress);
    return CustomerAddress;
};
