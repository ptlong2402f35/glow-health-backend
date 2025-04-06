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

    await queryInterface.changeColumn("Staffs", "gender", { type: Sequelize.INTEGER, allowNull: true});
    await queryInterface.changeColumn("Staffs", "images", { type: Sequelize.ARRAY(Sequelize.TEXT), allowNull: true});
    await queryInterface.changeColumn("Stores", "ownStaffId", { type: Sequelize.INTEGER, allowNull: true});
    await queryInterface.changeColumn("StaffServices", "description", { type: Sequelize.TEXT, allowNull: true});
    await queryInterface.changeColumn("StaffServices", "active", { type: Sequelize.BOOLEAN, allowNull: true});
    await queryInterface.changeColumn("Services", "serviceGroupId", { type: Sequelize.INTEGER, allowNull: true});
    await queryInterface.changeColumn("StaffServicePrices", "serviceGroupId", { type: Sequelize.INTEGER, allowNull: true});
    await queryInterface.changeColumn("Notifications", "seen", { type: Sequelize.BOOLEAN, allowNull: true});
    await queryInterface.changeColumn("Notifications", "status", { type: Sequelize.INTEGER, allowNull: true});
    await queryInterface.changeColumn("Notifications", "actionEvent", { type: Sequelize.JSON, allowNull: true});
    await queryInterface.changeColumn("Transactions", "content", { type: Sequelize.TEXT, allowNull: true});
    await queryInterface.changeColumn("Transactions", "success", { type: Sequelize.BOOLEAN, allowNull: true});
    await queryInterface.changeColumn("Transactions", "add", { type: Sequelize.BOOLEAN, allowNull: true});
    await queryInterface.changeColumn("Orders", "address", { type: Sequelize.TEXT, allowNull: true});
    await queryInterface.changeColumn("Orders", "communeId", { type: Sequelize.INTEGER, allowNull: true});
    await queryInterface.changeColumn("Orders", "long", { type: Sequelize.DOUBLE, allowNull: true});
    await queryInterface.changeColumn("Orders", "status", { type: Sequelize.INTEGER, allowNull: true});
    await queryInterface.changeColumn("Orders", "storeId", { type: Sequelize.INTEGER, allowNull: true});
    await queryInterface.changeColumn("Orders", "expiredAt", { type: Sequelize.DATE, allowNull: true});
    await queryInterface.changeColumn("Orders", "additionalFee", { type: Sequelize.DOUBLE, allowNull: true});
    await queryInterface.removeColumn("Orders", "staffServicePriceIds");
    await queryInterface.changeColumn("OrderForwarders", "status", { type: Sequelize.INTEGER, allowNull: true});
    await queryInterface.changeColumn("OrderForwarders", "timerTime", { type: Sequelize.DATE, allowNull: true});
    await queryInterface.changeColumn("Reviews", "status", { type: Sequelize.INTEGER, allowNull: true});
    await queryInterface.changeColumn("Reviews", "note", { type: Sequelize.TEXT, allowNull: true});



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
