const { PaymentMethod } = require("../../constants/constants");
const { OrderStatusInvalid, NotOwnerOrder } = require("../../constants/message")
const { OrderStatus, OrderForwarderStatus } = require("../../constants/status");
const { NotificationType, NotificationActionType } = require("../../constants/type");
const { sequelize } = require("../../model");
const { CommunicationService } = require("../communication/communicationService");
const { PaymentService } = require("../payment/paymentService");
const { TransactionService } = require("../transaction/transactionService");
const Order = require("../../model").Order;
const Staff = require("../../model").Staff;
const User = require("../../model").User;
const OrderForwarder = require("../../model").OrderForwarder;

class OrderCancelService {
    communicationService;
    transactionService;
    constructor() {
        this.communicationService = new CommunicationService();
        this.transactionService = new TransactionService();
    }

    async customerCancel(data, id) {
        let {order, staff, customerUser} = await this.prepare(id);
        if(data.userId != customerUser.id) throw NotOwnerOrder;
        if(!await this.validate(order, true)) return;

        await this.updateOrder(order, data);
        await this.updateOrderForwarder(order.id);
        await this.refund(order, customerUser);

    }

    async cancel(data, id) {
        let {order, staff, customerUser} = await this.prepare(id);
        if(!await this.validate(order)) return;

        await this.updateOrder(order, data, true);
        await this.updateStaff(staff);
        await this.refund(order, customerUser);
        //noti
        await this.customerNoti({userId: customerUser.id, orderId: data.orderId});

        return order;
    }

    async updateOrder(order, data, isStaffCancel) {
        await order.update(
            {
                status: isStaffCancel ? OrderStatus.StaffCanceled : OrderStatus.Canceled,
                reasonCancel: data.reasonCancel
            }
        );
    }

    async updateStaff(staff) {
        await staff.update(
            {
                busy: false,
            }
        )
    }

    async updateOrderForwarder(orderId) {
        await OrderForwarder.update(
            {
                status: OrderForwarderStatus.End
            },
            {
                where: {
                    orderId
                }
            }
        )
    }

    async refund(order, userCustomer) {
        if(!order || !userCustomer || order.paymentMethodId != PaymentMethod.Wallet) return;
        let transaction = await sequelize.transaction();
        try {
            if(userCustomer.totalMoney < money?.totalPay) throw UserMoneyNotEnoughException;
            await userCustomer.update(
                {
                    totalMoney: userCustomer.totalMoney + order?.totalPay || 0
                },
                {
                    transaction
                }
            );
            await this.createRefundTransaction(order, userCustomer);
            await transaction.commit();
            await this.notiRefund(userCustomer.id);
        }
        catch (err1) {
            await transaction.rollback();
            throw err1;
        }
    }

    async createRefundTransaction(order, userCustomer) {
        try {
            let amount = order.totalPay;
            let data = this.transactionService.build(
                {
                    forUserId: userCustomer.id,
                    content: `Hoàn tiền đơn hàng ${order.code}`,
                    orderId: order.id,
                    money: amount,
                    totalMoney: userCustomer.totalMoney,
                    userCreate: userCustomer.id,
                    add: true,
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

    async validate(order, isCustomerCancel) {
        if(!isCustomerCancel && ![OrderStatus.Approved].includes(order.status)) throw OrderStatusInvalid;
        if(isCustomerCancel && ![ OrderStatus.Pending].includes(order.status)) throw OrderStatusInvalid;

        return true;
    }

    async prepare(id) {
        console.log("id", id);
        let order =  await Order.findByPk(id);
        console.log("order ===", order.dataValues)
        let staff = await Staff.findOne(
            {
                where: {
                    id: order.staffId
                }
            }
        );
        let customerUser = await User.findByPk(order.customerUserId);

        return {
            order,
            staff,
            customerUser
        }
    }

    async customerNoti(data) {
        try {
            await this.communicationService.sendNotificationToUserId(
                data.userId,
                "Đơn hàng của bạn đã bị hủy",
                `Đơn hàng của bạn đã được Kỹ thuật viên hủy, vui lòng kiểm tra`,
                NotificationType.OrderCustomerDetail,
                {
                    actionType: NotificationActionType.OrderCustomerDetail.type
                },
                data.orderId
            );
        }
        catch (err) {
            console.error(err);
        }
        try {
            await this.communicationService.sendMobileNotification(
                data.userId,
                "Đơn hàng của bạn đã bị hủy",
                `Đơn hàng của bạn đã được Kỹ thuật viên hủy, vui lòng kiểm tra`,
            );
        }
        catch (err) {
            console.error(err);
        }
    }

    async notiRefund(userId) {
        try {
            await this.communicationService.sendNotificationToUserId(
                userId,
                "Hoàn tiền thành công",
                `Đơn hàng của bạn đã được hoàn tiền vào ví Glow Healthy, vui lòng kiểm tra`,
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
                userId,
                "Hoàn tiền thành công",
                `Đơn hàng của bạn đã được hoàn tiền vào ví Glow Healthy, vui lòng kiểm tra`,
            );
        }
        catch (err) {
            console.error(err);
        }
    }

    async staffNoti() {
        
    }
}

module.exports = {
    OrderCancelService
}