'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    queryInterface.removeColumn(
      "Orders", // table name
      "districtId",
    );
    queryInterface.addColumn(
      "Orders", // table name
      "districtId",
      {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
    );
    queryInterface.removeColumn(
      "Orders", // table name
      "vourcherId",
    );
    queryInterface.addColumn(
      "Orders", // table name
      "voucherId",
      {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
    );
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
