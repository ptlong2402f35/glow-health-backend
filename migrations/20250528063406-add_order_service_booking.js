"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn("Orders", "serviceBooking", { type: Sequelize.JSON });

  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Orders", "serviceBooking");

  },
};
