"use strict";
const { Model } = require("sequelize");
const sequelizePaginate = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
    class Order extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */

        static associate(models) {
            Order.belongsTo(models.User, {
				foreignKey: "customerUserId",
				as: "customerUser",
			});
            Order.belongsTo(models.Staff, {
				foreignKey: "staffId",
				as: "staff",
			});
            Order.belongsTo(models.Voucher, {
				foreignKey: "voucherId",
				as: "voucher",
			});
            Order.belongsToMany(models.StaffServicePrice, {
                through: "OrderPrices",
				foreignKey: "orderId",
				as: "prices",
			});
            Order.belongsTo(models.Store, {
				foreignKey: "storeId",
				as: "store",
			});
        }
    }
    Order.init(
        {
            staffId: DataTypes.INTEGER,
            total: DataTypes.DOUBLE,
            totalPay: DataTypes.DOUBLE,
            address: DataTypes.TEXT,
            provinceId: DataTypes.INTEGER,
            districtId: DataTypes.INTEGER,
            communeId: DataTypes.INTEGER,
            lat: DataTypes.DOUBLE,
            long: DataTypes.DOUBLE,
            status: DataTypes.INTEGER,
            customerUserId: DataTypes.INTEGER,
            paymentMethodId: DataTypes.INTEGER,
            fee: DataTypes.DOUBLE,
            code: DataTypes.TEXT,
            note: DataTypes.TEXT,
            earningRate: DataTypes.DOUBLE,
            storeId: DataTypes.INTEGER,
            reasonCancel: DataTypes.TEXT,
            totalReceive: DataTypes.DOUBLE,
            expiredAt: DataTypes.DATE,
            autoFinishAt: DataTypes.DATE,
            chatBoxId: DataTypes.INTEGER,
            timerTime: DataTypes.DATE,
            additionalFee: DataTypes.DOUBLE,
            type: DataTypes.INTEGER,
            forwardFromOrderId: DataTypes.INTEGER,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
            voucherId: DataTypes.INTEGER,
            customerAddress: DataTypes.JSON,
            serviceBooking: DataTypes.JSON,
            displayForCustomer: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
            orderSubStatus: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: "Order",
        },
    );
    sequelizePaginate.paginate(Order);
    return Order;
};
