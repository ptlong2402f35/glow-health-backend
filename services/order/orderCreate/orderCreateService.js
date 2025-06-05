const { PaymentMethod } = require("../../../constants/constants");
const { StaffRole } = require("../../../constants/roles");
const { OrderStatus } = require("../../../constants/status");
const { NotificationType, NotificationActionType } = require("../../../constants/type");
const { sequelize } = require("../../../model");
const { CommunicationService } = require("../../communication/communicationService");
const { TransactionService } = require("../../transaction/transactionService");
const { OrderForwarderService } = require("../orderForwarderService");
const { OrderCreateBuilder } = require("./orderCreateBuilder");
const Order = require("../../../model").Order;
const OrderPrice = require("../../../model").OrderPrice;
const Staff = require("../../../model").Staff;
const Transaction = require("../../../model").Transaction;
const UserMoneyNotEnoughException = "UserMoneyNotEnoughException";
const util = require("util");

class OrderCreateService {
    orderCreateBuilder;
    transactionService;
    communicationService;
    constructor() {
        this.orderCreateBuilder = new OrderCreateBuilder();
        this.communicationService = new CommunicationService();
        this.transactionService = new TransactionService();
    }

    async createSwitchOrderFromBaseOrder(baseOrder, forwardStaff) {
        try {

            let order = await Order.create(
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
                    status: OrderStatus.Approved,
                    serviceBooking: baseOrder.serviceBooking
                }
            );
            let orderPrices = await OrderPrice.findAll({where: {orderId: baseOrder.id}});
            let priceIds = orderPrices.map(item => item.staffServicePriceId).filter(val => val);
            await this.createOrderPrices(order.id, priceIds);

            return order;
        }
        catch (err) {
            throw err;
        }
    }

    async createDefaultOrder(data, staff, userCustomer, { isQuickForward} = {}) {
        try {
            let {dataOrder, address, orderCode, money} = await this.orderCreateBuilder.defaultBuilder(data, staff, userCustomer, { isQuickForward});

            console.log("=== dataOrder", util.inspect(dataOrder, false, null, true));

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
                    this.notiCustomerPrePaid(order);
                    break;
                }
                default: {
                    throw new Error("Payment method not supported");
                }
            }
            await this.createOrderPrices(order.id, data.staffServicePriceIds);
            await this.createOrderForwarder(order, staff);
            //noti
            this.noti(order, staff);
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

        console.log("=== orderPrices", util.inspect(data, false, null, true));

        return await OrderPrice.bulkCreate(data);
    }

    async createTransaction(order, userCustomer) {
        try {
            let amount = order.totalPay;
            console.log("total pay", amount);
            let data = this.transactionService.build(
                {
                    forUserId: userCustomer.id,
                    content: `Trả phí đơn hàng ${order.code}`,
                    orderId: order.id,
                    amount: amount,
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

    async noti(order, staff) {
        try {
            if(order.storeId) {
                let storeOwner = await Staff.findOne({
                    where: {
                        storeId: order.storeId,
                        staffRole: StaffRole.OwnerStation
                    }
                });
                await this.communicationService.sendNotificationToUserId(
                    storeOwner.userId,
                    "Khách đặt bạn",
                    `Có khách ở ${order.address}.Vui lòng kiểm tra thông tin`,
                    NotificationType.OrderDetail,
                    {
                        actionType: NotificationActionType.OrderDetail.type
                    },
                    order.id
                );
                await this.communicationService.sendMobileNotification(
                    storeOwner.userId,
                    "Khách đặt bạn",
                    `Có khách ở ${order.address}.Vui lòng kiểm tra thông tin`,
                );
            }
            
                await this.communicationService.sendNotificationToUserId(
                    staff.userId,
                    "Khách đặt bạn",
                    `Có khách ở ${order.address}.Vui lòng kiểm tra thông tin`,
                    NotificationType.OrderDetail,
                    {
                        actionType: NotificationActionType.OrderDetail.type
                    },
                    order.id
                );
                await this.communicationService.sendMobileNotification(
                    staff.userId,
                    "Khách đặt bạn",
                    `Có khách ở ${order.address}.Vui lòng kiểm tra thông tin`,
                );
        }
        catch (err) {
            console.error(err);
        }
    }

    async notiCustomerPrePaid(order) {
        try {
            await this.communicationService.sendNotificationToUserId(
                order.customerUserId,
                "Thông báo",
                `Thanh toán cho đơn hàng ${order.code} qua ví Glow Healthy thành công`,
                NotificationType.Transaction,
                {
                    actionType: NotificationActionType.Wallet.type
                }
            );
        }
        catch (err) {
            console.error(err);
        }

        try {
            await this.communicationService.sendMobileNotification(
                order.customerUserId,
                "Thông báo",
                `Thanh toán cho đơn hàng ${order.code} qua ví Glow Healthy thành công`,
            );
        }
        catch (err) {
            console.error(err);
        }
    }

}

module.exports = {
    OrderCreateService
}