const { Op } = require("sequelize");
const { OrderStatusInvalid } = require("../../constants/message");
const { OrderForwarderStatus, OrderStatus } = require("../../constants/status");
const { OrderType } = require("../../constants/type");
const { QuickForwardHandler } = require("./quickForward/quickForwardHandler");

let Order = require("../../model").Order;
let OrderForwarder = require("../../model").OrderForwarder;
let Staff = require("../../model").Staff;
let User = require("../../model").User;

class OrderReadyService {
    quickForwardHandler;
    constructor() {
        this.quickForwardHandler = new QuickForwardHandler();
    }

    async ownerReady(orderId, staff, chosenStaffIds) {
        let {order, orderForwarder} = await this.prepare(orderId, staff.id, staff.storeId);
        if(!await this.validate(order)) return;

        // approve order
        if(chosenStaffIds.includes(order.staffId)) {
            await this.approveOrder(orderId);
            await this.cancelOrderForwarder(orderId, null, staff.storeId);
            //noti approve

            return {
                isApproved: true,
                isReady: false,
                isQuickForward: false,
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
            //noti apply

            return {
                isApproved: false,
                isReady: false,
                isQuickForward: true,
            }
        }

        await this.readyOrder(orderForwarder);
        await this.updateStaffForwardIds(order, chosenStaffIds)
        //noti ready
        //socket ready
        return {
            isApproved: false,
            isReady: true,
            isQuickForward: false,
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

            return {
                isApproved: true,
                isReady: false,
                isQuickForward: false,
            }
        }

        // case quick order forwarder
        if(order.type === OrderType.QuickForward) {
            await this.quickForwardHandler.applyStaffForQuickForwardOrder(order, staff);
            await this.approveOrder(orderId);
            await this.cancelOrderForwarder(orderId, staff.id);
            //noti apply

            return {
                isApproved: false,
                isReady: false,
                isQuickForward: true,
            }
        }

        await this.readyOrder(orderForwarder);
        await this.updateStaffForwardIds(order, [staff.id]);
        //noti ready
        //socket ready
        return {
            isApproved: false,
            isReady: true,
            isQuickForward: false,
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

    async updateStaffForwardIds(order, staffIds) {
        await Order.update(
            {
                staffForwardIds: [...new Set([...(order.staffForwardIds || []), ...staffIds])],
            },
            {
                where: {
                    id: order.id
                }
            }
        )
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
                }
            }
        );

        return { order, orderForwarder };
    }

    async validate(order) {
        if(![OrderStatus.Denied, OrderStatus.Pending].includes(order.status)) throw OrderStatusInvalid;

        return true;
    }
}

module.exports = {
    OrderReadyService
}