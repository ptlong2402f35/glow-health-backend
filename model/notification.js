"use strict";
const { Model } = require("sequelize");
const sequelizePaginate = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
    class Notification extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */

        static associate(models) {
            
        }
    }
    Notification.init(
        {
            title: DataTypes.TEXT,
            content: DataTypes.TEXT,
            referenceId: DataTypes.INTEGER,
            seen: DataTypes.BOOLEAN,
            seenAt: DataTypes.DATE,
            toUserId: DataTypes.INTEGER,
            status: DataTypes.INTEGER,
            actionType: DataTypes.INTEGER,
            actionEvent: DataTypes.JSON,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: "Notification",
        },
    );
    sequelizePaginate.paginate(Notification);
    return Notification;
};
