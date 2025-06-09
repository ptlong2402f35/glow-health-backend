const { Op } = require("sequelize");
const { OrderStatusInvalid } = require("../../constants/message");
const { OrderForwarderStatus, OrderStatus, OrderSubStatus } = require("../../constants/status");
const { OrderType, NotificationType, NotificationActionType, OrderForwarderType } = require("../../constants/type");
const { QuickForwardHandler } = require("./quickForward/quickForwardHandler");
const { CommunicationService } = require("../communication/communicationService");
const ForwardStaffDuration = process.env.FORWARD_STAFF_DURATION ? parseInt(process.env.FORWARD_STAFF_DURATION) : 40 * 60 * 1000;

let Order = require("../../model").Order;
let OrderForwarder = require("../../model").OrderForwarder;
let Staff = require("../../model").Staff;
let User = require("../../model").User;

class OrderReadyService {
    quickForwardHandler;
    communicationService;
    constructor() {
        this.quickForwardHandler = new QuickForwardHandler();
        this.communicationService = new CommunicationService();
    }

    async ownerReady(orderId, staff, chosenStaffIds) {
        let {order, orderForwarder} = await this.prepare(orderId, staff.id, staff.storeId);
        if(!await this.validate(order)) return;

        // approve order
        if(chosenStaffIds.includes(order.staffId)) {
            await this.approveOrder(orderId);
            await this.cancelOrderForwarder(orderId, null, staff.storeId);
            //noti approve
            this.noti(order, staff);

            return {
                isApproved: true,
                isReady: false,
                isQuickForward: false,
                order: order,
            }
        }

        // case quick order forwarder
        if(order.type === OrderType.QuickForward) {
            let random = Math.floor(Math.random() * chosenStaffIds.length);
            let chosenStaffId = chosenStaffIds[random];
            let cStaff = await Staff.findByPk(chosenStaffId);
            await this.quickForwardHandler.applyStaffForQuickForwardOrder(order, cStaff);
            await this.approveOrder(orderId);
            await this.cancelOrderForwarder(orderId, null, staff.storeId);
            await Staff.update(
                {
                    busy: true,
                },
                {
                    where: {
                        id: chosenStaffId
                    }
                }
            );
            //noti apply
            this.noti(order, staff);

            return {
                isApproved: false,
                isReady: false,
                isQuickForward: true,
                order,
            }
        }

        await this.storeReadyOrder(orderForwarder, order, chosenStaffIds);
        //noti ready
        //socket ready
        return {
            isApproved: false,
            isReady: true,
            isQuickForward: false,
            order,
        }
    }

    async ready(orderId, staff) {
        let {order, orderForwarder} = await this.prepare(orderId, staff.id, staff.storeId);
        if(!await this.validate(order)) return;

        // approve order
        if(order.staffId === staff.id) {
            await this.approveOrder(orderId);
            await this.cancelOrderForwarder(orderId, staff.id);
            //noti approve
            this.noti(order, staff);

            return {
                isApproved: true,
                isReady: false,
                isQuickForward: false,
                order,
            }
        }

        // case quick order forwarder
        if(order.type === OrderType.QuickForward) {
            await this.quickForwardHandler.applyStaffForQuickForwardOrder(order, staff);
            await this.approveOrder(orderId);
            await this.cancelOrderForwarder(orderId, staff.id);
            await Staff.update(
                {
                    busy: true,
                },
                {
                    where: {
                        id: staff.id
                    }
                }
            );
            //noti apply
            this.noti(order, staff);

            return {
                isApproved: false,
                isReady: false,
                isQuickForward: true,
                order
            }
        }

        await this.readyOrder(orderForwarder);
        //noti ready
        //socket ready
        return {
            isApproved: false,
            isReady: true,
            isQuickForward: false,
            order
        }

    }

    async approveOrder(orderId) {
        await Order.update(
            {
                status: OrderStatus.Approved,
                //auto finish after 1 day if staff not finish order
                autoFinishAt: new Date(new Date().getTime() + (24 * 60 * 60 * 1000)),
            },
            {
                where: {
                    id: orderId
                }
            }
        );
    }

    async readyOrder(orderForwarder) {
        await OrderForwarder.update(
            {
                isAccept: true
            },
            {
                where: {
                    id: orderForwarder.id
                }
            }
        )
    }

    async storeReadyOrder(orderForwarder, order, chosenStaffIds) {
        console.log("orderForward", orderForwarder?.dataValues)
        if(orderForwarder) {
            await OrderForwarder.update(
                {
                    isAccept: true
                },
                {
                    where: {
                        id: orderForwarder.id
                    }
                }
            )
        }
        else {
            await order.update(
                {
                    orderSubStatus: OrderSubStatus.StoreReady
                }
            );
        }
        let cur = new Date();
		let expiredAt = new Date(cur.getTime() + ForwardStaffDuration);

        let forwarders = (chosenStaffIds || [])?.map(item => ({
            status: OrderForwarderStatus.Begin,
            isAccept: true,
            orderId: orderForwarder?.orderId || order?.id,
            staffId: item,
            expiredAt: orderForwarder?.expiredAt || expiredAt,
            createdAt: cur,
            updatedAt: cur,
            storeId: 0,
            type: OrderForwarderType.Normal,
            timerTime: orderForwarder?.timerTime || order?.timerTime || cur,
        }));
        await OrderForwarder.bulkCreate(
            forwarders,
            { ignoreDuplicates: true }
        );

        return;

    }

    async cancelOrderForwarder(orderId, targetStaffId, targetStoreId) {
        await OrderForwarder.update(
            {
                status: OrderForwarderStatus.End
            },
            {
                where: {
                    orderId: orderId,
                }
            }
        );

        if(targetStaffId) {
            await OrderForwarder.update(
                {
                    status: OrderForwarderStatus.Switched
                },
                {
                    where: {
                        orderId: orderId,
                        staffId: targetStaffId
                    }
                }
            );
        }

        if(targetStoreId) {
            await OrderForwarder.update(
                {
                    status: OrderForwarderStatus.Switched
                },
                {
                    where: {
                        orderId: orderId,
                        staffId: 0,
                        storeId: targetStoreId
                    }
                }
            );
        }
    }

    async prepare(orderId, staffId, storeId) {
        let order = await Order.findByPk(
            orderId,
        );
        let orderForwarder = await OrderForwarder.findOne(
            {
                where: {
                    orderId: orderId,
                    [Op.or]: [
                        {
                            staffId: staffId
                        },
                        {
                            storeId: storeId
                        }
                    ]
                },
                logging: true
            }
        );

        return { order, orderForwarder };
    }

    async validate(order) {
        if(![OrderStatus.Denied, OrderStatus.Pending].includes(order.status)) throw OrderStatusInvalid;

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
                `Đơn hàng của bạn đã được Kỹ thuật viên chấp nhận, vui lòng kiểm tra`,
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
                `Đơn hàng của bạn đã được Kỹ thuật viên chấp nhận, vui lòng kiểm tra`,
            );
        }
        catch (err) {
            console.error(err);
        }
    }
}

module.exports = {
    OrderReadyService
}