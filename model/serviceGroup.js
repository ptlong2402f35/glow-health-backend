"use strict";
const { Model } = require("sequelize");
const sequelizePaginate = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
    class ServiceGroup extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */

        static associate(models) {
            
        }
    }
    ServiceGroup.init(
        {
            name: DataTypes.TEXT,
            active: DataTypes.BOOLEAN,
            image: DataTypes.TEXT,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: "ServiceGroup",
        },
    );
    sequelizePaginate.paginate(ServiceGroup);
    return ServiceGroup;
};
