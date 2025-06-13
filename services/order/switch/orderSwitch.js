const { Op } = require("sequelize");
const { OrderForwarderStatus, OrderStatus } = require("../../../constants/status");
const { OrderStatusInvalid, StaffBusy } = require("../../../constants/message");
const { sequelize } = require("../../../model");
const { OrderCreateService } = require("../orderCreate/orderCreateService");
const { NotificationType, NotificationActionType } = require("../../../constants/type");
const { CommunicationService } = require("../../communication/communicationService");

const Order = require("../../../model").Order;
const OrderForwarder = require("../../../model").OrderForwarder;
const Staff = require("../../../model").Staff;

class OrderSwitch {
    orderCreateService;
    communicationService;
    constructor() {
        this.orderCreateService = new OrderCreateService();
        this.communicationService = new CommunicationService();
    }

    async switchOrderToForwarder(baseOrderId, forwardOrderId) {
        console.log("baseOrderId", baseOrderId);
        console.log("forwardOrderId", forwardOrderId);
        let {baseOrder, anotherFOrder, forwardOrder, forwardStaff} = await this.prepare(baseOrderId, forwardOrderId);
        if(!await this.validate(baseOrder, forwardStaff)) return;
        await this.cancelBaseOrder(baseOrder);
        await this.cancelAnotherForwardOrder(anotherFOrder);
        let switchedOrder = await this.updateAndCreateForwardOrder(baseOrder, forwardOrder, forwardStaff);
        await this.updateForwardStaff(forwardStaff);

        //noti
        await this.noti(switchedOrder, forwardStaff);

        return {
            switchedOrder,
            forwardStaff,
        };
    }

    async cancelBaseOrder(baseOrder) {
        await baseOrder.update(
            {
                status: OrderStatus.Canceled,
                displayForCustomer: false
            }
        );
    }

    async cancelAnotherForwardOrder(anotherFOrder) {
        let ids = anotherFOrder.map(item => item.id).filter(val => val);
        await OrderForwarder.update(
            {
                status: OrderForwarderStatus.End
            },
            {
                where: {
                    id: {
                        [Op.in]: ids
                    }
                }
            }
        );
    }

    async updateAndCreateForwardOrder(baseOrder, forwardOrder, forwardStaff) {
        await forwardOrder.update(
            {
                status: OrderForwarderStatus.Switched
            }
        );

        return await this.orderCreateService.createSwitchOrderFromBaseOrder(baseOrder, forwardStaff);
    }

    async updateForwardStaff(forwardStaff) {
        await Staff.update(
            {
                busy: true
            },
            {
                where: {
                    id: forwardStaff.id
                }
            }
        );
    }

    async prepare(baseOrderId, forwardOrderId) {
        let baseOrder = await Order.findByPk(baseOrderId);
        let anotherFOrder = await OrderForwarder.findAll(
            {
                where: {
                    orderId: baseOrderId,
                    id: {
                        [Op.not]: forwardOrderId 
                    }
                }
            }
        );
        let forwardOrder = await OrderForwarder.findByPk(forwardOrderId);
        let forwardStaff = await Staff.findOne(
            {
                where: {
                    id: forwardOrder.staffId
                }
            }
        );

        return {
            baseOrder,
            anotherFOrder,
            forwardOrder,
            forwardStaff
        }
    }

    async validate(baseOrder, staff) {
        if(![OrderStatus.Pending, OrderStatus.Denied].includes(baseOrder.status)) throw OrderStatusInvalid;
        if(staff.busy) throw StaffBusy;
        return true;
    }

    async noti(order, staff) {
        try {
            await this.communicationService.sendNotificationToUserId(
                staff.userId,
                "Kết nối thành công",
                `Vui lòng liên hệ với khách`,
                NotificationType.OrderDetail,
                {
                    actionType: NotificationActionType.OrderDetail.type
                },
                order.id
            );
        }
        catch (err) {
            console.error(err);
        }

        try {
            await this.communicationService.sendNotificationToUserId(
                order.customerUserId,
                "Đơn hàng đã được kết nối",
                `Đơn hàng của bạn đã được đổi KTV thành công, vui lòng kiểm tra`,
                NotificationType.OrderCustomerDetail,
                {
                    actionType: NotificationActionType.OrderCustomerDetail.type
                },
                order.id
            );
        }
        catch (err) {
            console.error(err);
        }

        try {
            await this.communicationService.sendMobileNotification(
                staff.userId,
                "Kết nối thành công",
                `Vui lòng liên hệ với khách`,
            );
        }
        catch (err) {
            console.error(err);
        }

        try {
            await this.communicationService.sendMobileNotification(
                order.customerUserId,
                "Đơn hàng đã được kết nối",
                `Đơn hàng của bạn đã được đổi KTV thành công, vui lòng kiểm tra`,
            );
        }
        catch (err) {
            console.error(err);
        }
    }
}

module.exports = {
    OrderSwitch
}