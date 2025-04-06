"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Transactions", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			code: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			forUserId: {
				allowNull: true,
				type: Sequelize.INTEGER,
			},
			status: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			content: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
      orderId: {
				allowNull: true,
				type: Sequelize.INTEGER,
			},
			money: {
				type: Sequelize.DOUBLE,
				allowNull: true,
			},
			totalMoney: {
				type: Sequelize.DOUBLE,
				allowNull: false,
			},
      userCreate: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			success: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
			},
      add: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
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
		await queryInterface.dropTable("Transactions");
	},
};
