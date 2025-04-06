"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Staffs", {
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
			userId: {
				allowNull: true,
				type: Sequelize.INTEGER,
			},
			age: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			gender: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			images: {
				type: Sequelize.ARRAY(Sequelize.TEXT),
				allowNull: false,
			},
			active: {
				type: Sequelize.BOOLEAN,
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
			coordinate: {
				type: Sequelize.DataTypes.GEOMETRY("POINT"),
				allowNull: true,
			},
			online: {
				type: Sequelize.BOOLEAN,
				allowNull: true,
			},
      		description: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
      storeId: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			staffRole: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
      		busy: {
				type: Sequelize.BOOLEAN,
				allowNull: true,
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
      rateAvg: {
				type: Sequelize.DOUBLE,
				allowNull: true,
			},
      countReview: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			type: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
      		serviceIds: {
				type: Sequelize.ARRAY(Sequelize.INTEGER),
				allowNull: true,
			},
      serviceGroupIds: {
				type: Sequelize.ARRAY(Sequelize.INTEGER),
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
		await queryInterface.dropTable("Staffs");
	},
};
