"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("OrderForwarders", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			staffId: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			orderId: {
				allowNull: true,
				type: Sequelize.INTEGER,
			},
			isAccept: {
				type: Sequelize.BOOLEAN,
				allowNull: true,
			},
			status: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
      storeId: {
				allowNull: true,
				type: Sequelize.INTEGER,
			},
			expiredAt: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			timerTime: {
				type: Sequelize.DATE,
				allowNull: false,
			},
      type: {
				type: Sequelize.INTEGER,
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
		await queryInterface.dropTable("OrderForwarders");
	},
};
