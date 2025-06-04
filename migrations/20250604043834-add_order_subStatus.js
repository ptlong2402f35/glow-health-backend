"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn("Orders", "orderSubStatus", { type: Sequelize.INTEGER });

  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Orders", "orderSubStatus");

  },
};
