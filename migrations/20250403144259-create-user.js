"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Users", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			userName: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			phone: {
				allowNull: true,
				type: Sequelize.TEXT,
			},
			email: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			password: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			role: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			urlImage: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			active: {
				type: Sequelize.BOOLEAN,
				allowNull: true,
			},
      		gender: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			totalMoney: {
				type: Sequelize.DOUBLE,
				allowNull: true,
			},
			chatBoxUpdatedAt: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			unreadMessageCount: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
      		userCoordinate: {
				type: Sequelize.DataTypes.GEOMETRY("POINT"),
				allowNull: true,
			},
      		resetKey: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
      resetKeyExpiredAt: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: new Date(),
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: new Date(),
			}
		});
	},
	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("Users");
	},
};
