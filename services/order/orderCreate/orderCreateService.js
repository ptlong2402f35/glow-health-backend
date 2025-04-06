const { PaymentMethod } = require("../../../constants/constants");
const { OrderStatus } = require("../../../constants/status");
const { sequelize } = require("../../../model");
const { OrderForwarderService } = require("../orderForwarderService");
const { OrderCreateBuilder } = require("./orderCreateBuilder");
const Order = require("../../../model").Order;
const OrderPrice = require("../../../model").OrderPrice;
const Staff = require("../../../model").Staff;
const Transaction = require("../../../model").Transaction;
const UserMoneyNotEnoughException = "UserMoneyNotEnoughException";

class OrderCreateService {
    orderCreateBuilder;
    transactionService;
    constructor() {
        this.orderCreateBuilder = new OrderCreateBuilder();

    }

    async createSwitchOrderFromBaseOrder(baseOrder, forwardStaff) {
        await Order.create(
            {
                total: baseOrder.total,
                totalPay: baseOrder.totalPay,
                address: baseOrder.address,
                provinceId: baseOrder.provinceId,
                districtId: baseOrder.districtId,
                communeId: baseOrder.communeId,
                lat: baseOrder.lat,
                long: baseOrder.long,
                customerUserId: baseOrder.customerUserId,
                paymentMethodId: baseOrder.paymentMethodId,
                fee: baseOrder.fee,
                note: baseOrder.note,
                earningRate: baseOrder.earningRate,
                reasonCancel: baseOrder.reasonCancel,
                totalReceive: baseOrder.totalReceive,
                expiredAt: baseOrder.expiredAt,
                autoFinishAt: baseOrder.autoFinishAt,
                chatBoxId: baseOrder.chatBoxId,
                timerTime: baseOrder.timerTime,
                additionalFee: baseOrder.additionalFee,
                type: baseOrder.type,
                staffId: forwardStaff.id,
                storeId: forwardStaff.storeId || 0,
                code: this.orderCreateBuilder.generateCode(),
                forwardFromOrderId: baseOrder.id,
                status: OrderStatus.Approved
            }
        );
    }

    async createDefaultOrder(data, staff, userCustomer, { isQuickForward} = {}) {
        try {
            let {dataOrder, address, orderCode, money} = await this.orderCreateBuilder.defaultBuilder(data, staff, userCustomer, { isQuickForward});

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

                    break;
                }
                case PaymentMethod.Wallet: {
                    let transaction = await sequelize.transaction();
                    try {
                        if(userCustomer.totalMoney < money?.totalPay) throw UserMoneyNotEnoughException;
                        await userCustomer.update(
                            {
                                totalMoney: userCustomer.totalMoney - money.totalPay
                            },
                            {
                                transaction
                            }
                        );
                        order = await Order.create(dataOrder, {transaction});
                        await transaction.commit();
                    }
                    catch (err1) {
                        await transaction.rollback();
                        throw err1;
                    }
                    await this.createTransaction(order, userCustomer);

                    break;
                }
                default: {
                    throw new Error("Payment method not supported");
                }
            }
            await this.createOrderPrices(order.id, data.staffServicePriceIds);
            await this.createOrderForwarder(order);
            //noti

            return order;
        }
        catch (err) {
            throw err;
        }
    }

    async createOrderForwarder(order) {
        try {
            await new OrderForwarderService().startOrderForwardingFromId(order.id);
        }
        catch (err) {
            throw err;
        }
    }

    async createOrderPrices(orderId, priceIds) {
        let data = priceIds.map(item => ({
            orderId: orderId,
            staffServicePriceId: item
        }));

        return await OrderPrice.bulkCreate(data);
    }

    async createTransaction(order, userCustomer) {
        try {
            let amount = order.totalPay;
            let data = this.transactionService.build(
                {
                    forUserId: userCustomer.id,
                    content: `Trả phí đơn hàng ${order.code}`,
                    orderId: order.id,
                    money: amount,
                    totalMoney: userCustomer.totalMoney,
                    userCreate: userCustomer.id,
                    add: false,
                }
            )
            
            let trans =  await Transaction.create(
                data
            );

            return trans;
        }
        catch (err) {
            throw err;
        }
    }

    async noti(order, userCustomer, baseStaff) {
        try {
            //noti
        }
        catch (err) {
            throw err;
        }
    }

}

module.exports = {
    OrderCreateService
}