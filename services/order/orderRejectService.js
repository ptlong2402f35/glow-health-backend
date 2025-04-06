const { Op } = require("sequelize");
const { OrderStatusInvalid, InputInfoEmpty } = require("../../constants/message");
const { OrderStatus, OrderForwarderStatus } = require("../../constants/status");

const Order = require("../../model").Order;
const Staff = require("../../model").Staff;
const User = require("../../model").User;
const OrderForwarder = require("../../model").OrderForwarder;

class OrderRejectService {
    constructor() {}

    async ownerReject(orderId, staff) {
        try {
            if(!orderId || !staff) throw InputInfoEmpty;
            let {order, orderForwarder} = await this.prepare(orderId, staff.id, staff.storeId);

            if(order.storeId === staff.storeId) {
                await this.rejectOrder(orderId);
            }
            
            await this.rejectOwnerForwarder(order.id, staff.storeId);

        }
        catch (err) {
            throw err;
        }
    }

    async defaultReject(orderId, staff) {
        try {
            let isOwner;
            if(!orderId || !staff) throw InputInfoEmpty;
            let {order, orderForwarder} = await this.prepare(orderId, staff.id, staff.storeId);
            if(order.staffId === staff.id) {
                await this.rejectOrder(orderId);
                isOwner = true;
            }
            await this.rejectForwarder(orderForwarder.id);
            if(isOwner) {

            }

            return isOwner;

        }
        catch (err) {
            throw err;
        }
    }

    async rejectForwarder(forwarderId) {
        if(!forwarderId) return;
        await OrderForwarder.update(
            {
                status: OrderForwarderStatus.Reject,
            },
            {
                where: {
                    id: forwarderId
                }
            }
        )
    }

    async rejectOwnerForwarder(orderId, storeId) {
        await OrderForwarder.update(
            {
                status: OrderForwarderStatus.Reject,
            },
            {
                where: {
                    orderId,
                    storeId
                }
            }
        )
    }

    async rejectOrder(orderId) {
        await Order.update(
            {
                status: OrderStatus.Denied
            },
            {
                where: {
                    id: orderId
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
        if(![OrderStatus.Pending].includes(order.status)) throw OrderStatusInvalid;

        return true;
    }
}

module.exports = {
    OrderRejectService
}