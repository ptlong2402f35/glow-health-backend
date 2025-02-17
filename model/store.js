"use strict";
const { Model } = require("sequelize");
const sequelizePaginate = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
    class Store extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */

        static associate(models) {
            Store.belongsTo(models.Staff, {
                foreignKey: "ownStaffId",
                constraints: false,
                as: "storeOwnerStaff",
            });
            Store.hasMany(models.Staff, {
                foreignKey: "storeId",
                as: "storeMembers"
            });
            Store.hasMany(models.User, {
                foreignKey: "ownUserId",
                as: "storeOwnerUser"
            });
        }
    }
    Store.init(
        {
            name: DataTypes.TEXT,
            status: DataTypes.INTEGER,
            ownUserId: DataTypes.INTEGER,
            ownStaffId: DataTypes.INTEGER,
            createdAt: DataTypes.DATE,
			updatedAt: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: "Store",
        },
    );
    sequelizePaginate.paginate(Store);
    return Store;
};
