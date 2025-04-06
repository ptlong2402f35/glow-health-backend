"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("StaffServices", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			name: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			status: {
				allowNull: true,
				type: Sequelize.INTEGER,
			},
			code: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			active: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
			},
			description: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			serviceGroupId: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			staffId: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
      serviceId: {
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
		await queryInterface.dropTable("StaffServices");
	},
};
