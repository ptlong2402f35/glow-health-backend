"use strict";
const { Model } = require("sequelize");
const sequelizePaginate = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
    class Service extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */

        static associate(models) {

        }
    }
    Service.init(
        {
            name: DataTypes.TEXT,
            active: DataTypes.BOOLEAN,
            description: DataTypes.TEXT,
            serviceGroupId: DataTypes.INTEGER,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: "Service",
        },
    );
    sequelizePaginate.paginate(Service);
    return Service;
};
