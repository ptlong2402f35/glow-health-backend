const { PaymentMethod } = require("../../constants/constants");
const { OrderStatusInvalid } = require("../../constants/message")
const { OrderStatus } = require("../../constants/status");
const { NotificationType, NotificationActionType } = require("../../constants/type");
const { sequelize } = require("../../model");
const { CommunicationService } = require("../communication/communicationService");
const { TransactionService } = require("../transaction/transactionService");
const Order = require("../../model").Order;
const Staff = require("../../model").Staff;
const User = require("../../model").User;

class OrderApproveService {
    communicationService;
    constructor() {
        this.communicationService = new CommunicationService();
    }

    async approve(id) {
        let {order, staff, customerUser} = await this.prepare(id);
        if(!await this.validate(order)) return;

        await this.updateOrder(order, data);
        await this.updateStaff(staff);
        //noti
        this.customerNoti({userId: customerUser.id, orderId: order.id});
        this.staffNoti({userId: staff.userId, orderId: order.id});
        //create chatbox
    }

    async updateOrder(order) {
        await order.update(
            {
                status: OrderStatus.Approved,
            }
        );
    }

    async updateStaff(staff, order) {
        //schedule case
        if(order.timeTime > new Date().getTime() + 2*60*60*1000) return;
        //current case
        await staff.update(
            {
                busy: true,
            }
        )
    }

    async validate(order) {
        if(![OrderStatus.Pending].includes(order.status)) throw OrderStatusInvalid;

        return true;
    }

    async prepare(id) {
        let order =  await Order.findByPk(id);
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
                "Đơn hàng đã được kết nối",
                `Đơn hàng của bạn đã được Kỹ thuật viên chấp nhận, vui lòng kiểm tra`,
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
                "Đơn hàng đã được kết nối",
                `Đơn hàng của bạn đã được Kỹ thuật viên chấp nhận, vui lòng kiểm tra`,
            );
        }
        catch (err) {
            console.error(err);
        }
    }

    async staffNoti(data) {
        try {
            await this.communicationService.sendNotificationToUserId(
                data.userId,
                "Kết nối thành công",
                `Vui lòng liên hệ với khách`,
                NotificationType.OrderDetail,
                {
                    actionType: NotificationActionType.OrderDetail.type
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
                "Kết nối thành công",
                `Vui lòng liên hệ với khách`,
            );
        }
        catch (err) {
            console.error(err);
        }
    }
}

module.exports = {
    OrderApproveService
}