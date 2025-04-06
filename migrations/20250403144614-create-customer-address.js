"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("CustomerAddresses", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			customerName: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			phone: {
				allowNull: true,
				type: Sequelize.TEXT,
			},
			default: {
				type: Sequelize.BOOLEAN,
				allowNull: true,
			},
			active: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
			},
			customerUserId: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			provinceId: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			districtId: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
      		communeId: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			address: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			lat: {
				type: Sequelize.DOUBLE,
				allowNull: true,
			},
			long: {
				type: Sequelize.DOUBLE,
				allowNull: true,
			},
      		note: {
				type: Sequelize.TEXT,
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
		await queryInterface.dropTable("CustomerAddresses");
	},
};
