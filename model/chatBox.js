"use strict";
const { Model } = require("sequelize");
const sequelizePaginate = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
    class ChatBox extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */

        static associate(models) {

        }
    }
    ChatBox.init(
        {
            orderId: DataTypes.INTEGER,
            memberIds: DataTypes.ARRAY(DataTypes.INTEGER),
            status: DataTypes.INTEGER,
            lastMessage: DataTypes.TEXT,
            lastMessageSendAt: DataTypes.DATE,
            memberInfor: DataTypes.JSON,
            lastMessageType: DataTypes.INTEGER,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: "ChatBox",
        },
    );
    sequelizePaginate.paginate(ChatBox);
    return ChatBox;
};
