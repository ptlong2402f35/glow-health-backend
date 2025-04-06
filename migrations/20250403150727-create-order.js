"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Orders", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			staffId: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			total: {
				allowNull: true,
				type: Sequelize.DOUBLE,
			},
			totalPay: {
				type: Sequelize.DOUBLE,
				allowNull: true,
			},
			address: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
      provinceId: {
				allowNull: true,
				type: Sequelize.INTEGER,
			},
			districId: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			communeId: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
      lat: {
				type: Sequelize.DOUBLE,
				allowNull: true,
			},
			long: {
				type: Sequelize.DOUBLE,
				allowNull: false,
			},
      status: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
      customerUserId: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			paymentMethodId: {
				allowNull: true,
				type: Sequelize.INTEGER,
			},
			fee: {
				type: Sequelize.DOUBLE,
				allowNull: true,
			},
			code: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
      note: {
				allowNull: true,
				type: Sequelize.TEXT,
			},
			earningRate: {
				type: Sequelize.DOUBLE,
				allowNull: true,
			},
			storeId: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
      reasonCancel: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			totalReceive: {
				type: Sequelize.DOUBLE,
				allowNull: false,
			},
      expiredAt: {
				type: Sequelize.DATE,
				allowNull: false,
			},
      autoFinishAt: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			chatBoxId: {
				allowNull: true,
				type: Sequelize.INTEGER,
			},
			timerTime: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			additionalFee: {
				type: Sequelize.DOUBLE,
				allowNull: false,
			},
      type: {
				allowNull: true,
				type: Sequelize.INTEGER,
			},
			forwardFromOrderId: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			staffServicePriceIds: {
				type: Sequelize.ARRAY(Sequelize.INTEGER),
				allowNull: false,
			},
      voucherId: {
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
		await queryInterface.dropTable("Orders");
	},
};
