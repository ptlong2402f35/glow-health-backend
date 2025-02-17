"use strict";
const { Model } = require("sequelize");
const sequelizePaginate = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
    class ChatMessage extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */

        static associate(models) {

        }
    }
    ChatMessage.init(
        {
            chatBoxId: DataTypes.INTEGER,
            type: DataTypes.INTEGER,
            content: DataTypes.TEXT,
            specialContent: DataTypes.ARRAY(DataTypes.TEXT),
            status: DataTypes.INTEGER,
            seen: DataTypes.BOOLEAN,
            sendByUserId: DataTypes.INTEGER,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: "ChatMessage",
        },
    );
    sequelizePaginate.paginate(ChatMessage);
    return ChatMessage;
};
