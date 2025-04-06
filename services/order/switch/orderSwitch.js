const { Op } = require("sequelize");
const { OrderForwarderStatus, OrderStatus } = require("../../../constants/status");
const { OrderStatusInvalid } = require("../../../constants/message");
const { sequelize } = require("../../../model");
const { OrderCreateService } = require("../orderCreate/orderCreateService");

const Order = require("../../../model").Order;
const OrderForwarder = require("../../../model").OrderForwarder;
const Staff = require("../../../model").Staff;

class OrderSwitch {
    orderCreateService;
    constructor() {
        this.orderCreateService = new OrderCreateService();
    }

    async switchOrderToForwarder(baseOrderId, forwardOrderId) {
        console.log("baseOrderId", baseOrderId);
        console.log("forwardOrderId", forwardOrderId);
        let {baseOrder, anotherFOrder, forwardOrder, forwardStaff} = await this.prepare(baseOrderId, forwardOrderId);
        if(!await this.validate(baseOrder)) return;
        console.log("ano", anotherFOrder)
        await this.cancelBaseOrder(baseOrder);
        await this.cancelAnotherForwardOrder(anotherFOrder);
        await this.updateAndCreateForwardOrder(baseOrder, forwardOrder, forwardStaff);
        await this.updateForwardStaff(forwardStaff);

        //noti
    }

    async cancelBaseOrder(baseOrder) {
        await baseOrder.update(
            {
                status: OrderStatus.Canceled
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

        await this.orderCreateService.createSwitchOrderFromBaseOrder(baseOrder, forwardStaff);
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

    async validate(baseOrder) {
        if(![OrderStatus.Pending, OrderStatus.Denied].includes(baseOrder.status)) throw OrderStatusInvalid;
        return true;
    }
}

module.exports = {
    OrderSwitch
}