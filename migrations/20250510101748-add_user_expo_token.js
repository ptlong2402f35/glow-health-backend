"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		/**
		 * Add altering commands here.
		 *
		 * Example:
		 * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
		 */
    await queryInterface.addColumn("Users", "expoToken", { type: Sequelize.TEXT });

	},

	down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "expoToken");

	},
};
