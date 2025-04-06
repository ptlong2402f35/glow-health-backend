"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Notifications", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			title: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			content: {
				allowNull: true,
				type: Sequelize.TEXT,
			},
			referenceId: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			seen: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
			},
      seenAt: {
				allowNull: true,
				type: Sequelize.DATE,
			},
			toUserId: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			status: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
      actionType: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			actionEvent: {
				type: Sequelize.JSON,
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
		await queryInterface.dropTable("Notifications");
	},
};
