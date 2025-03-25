const { PaymentMethod } = require("../../../constants/constants");
const { sequelize } = require("../../../model");
const { OrderCreateBuilder } = require("./orderCreateBuilder");
const Order = require("../../../model").Order;

class OrderCreateService {
    orderCreateBuilder;
    constructor() {
        this.orderCreateBuilder = new OrderCreateBuilder();
    }

    async createDefaultOrder(data, staff, userCustomer, { isQuickForward} = {}) {
        try {
            let {dataOrder, address, orderCode, timeData, money} = await this.orderCreateBuilder.defaultBuilder(data, staff, userCustomer, { isQuickForward});

            let order;
            switch(data.paymentMethodId) {
                case PaymentMethod.Cash: {
                    let transaction = await sequelize.transaction();

                    try {
                        order = await Order.create(dataOrder, {transaction});
                        await transaction.commit();
                    }
                    catch (err1) {
                        await transaction.rollback();
                        throw err1;
                    }
                }
                case PaymentMethod.Wallet: {

                }
                default: {
                    throw new Error("Payment method not supported");
                }
            }
        }
        catch (err) {
            throw err;
        }
    }

    async createOrderForwarder() {

    }

    async createTransaction() {

    }

}

module.exports = {
    OrderCreateService
}