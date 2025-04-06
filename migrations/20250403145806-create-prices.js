"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("StaffServicePrices", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			staffServiceId: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			price: {
				allowNull: true,
				type: Sequelize.DOUBLE,
			},
			unit: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			serviceGroupId: {
				type: Sequelize.INTEGER,
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
		await queryInterface.dropTable("StaffServicePrices");
	},
};
