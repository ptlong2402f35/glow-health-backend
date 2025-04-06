"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Vouchers", {
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
			reduceValue: {
				allowNull: true,
				type: Sequelize.DOUBLE,
			},
			reducePercent: {
				type: Sequelize.DOUBLE,
				allowNull: true,
			},
			startAt: {
				type: Sequelize.DATE,
				allowNull: true,
			},
      endAt: {
				allowNull: true,
				type: Sequelize.DATE,
			},
			status: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			scope: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
      staffId: {
				type: Sequelize.INTEGER,
				allowNull: true,
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
		await queryInterface.dropTable("Vouchers");
	},
};
