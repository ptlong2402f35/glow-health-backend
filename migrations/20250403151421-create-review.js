"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Reviews", {
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
			customerUserId: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			status: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
      staffServiceId: {
				allowNull: true,
				type: Sequelize.INTEGER,
			},
			rate: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			note: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
      storeId: {
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
		await queryInterface.dropTable("Reviews");
	},
};
