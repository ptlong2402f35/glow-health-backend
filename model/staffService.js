"use strict";
const { Model } = require("sequelize");
const sequelizePaginate = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
    class StaffService extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */

        static associate(models) {
            StaffService.belongsTo(models.Staff, {
                foreignKey: "staffId",
                constraints: false,
                as: "staff",
            });
            StaffService.belongsTo(models.Service, {
                foreignKey: "serviceId",
                as: "service"
            });
            StaffService.belongsTo(models.ServiceGroup, {
                foreignKey: "serviceGroupId",
                as: "serviceGroup"
            });
            StaffService.hasMany(models.StaffServicePrice, {
                foreignKey: "staffServiceId",
                as: "prices"
            });
        }
    }
    StaffService.init(
        {
            name: DataTypes.TEXT,
            status: DataTypes.INTEGER,
            code: DataTypes.TEXT,
            active: DataTypes.BOOLEAN,
            description: DataTypes.TEXT,
            serviceGroupId: DataTypes.INTEGER,
            staffId: DataTypes.INTEGER,
            serviceId: DataTypes.INTEGER,
            createdAt: DataTypes.DATE,
			updatedAt: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: "StaffService",
        },
    );
    sequelizePaginate.paginate(StaffService);
    return StaffService;
};
