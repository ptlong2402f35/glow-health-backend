const { OrderStatus, OrderForwarderStatus } = require("../../constants/status");

const ScheduleOrderTimer = process.env.SCHEDULE_ORDER_TIMER || 1000 * 60 * 30; // 30 minutes


class OrderHelper {
    constructor() {}

    async orderStaffProcessDisplay(orders, orderForwarders, opts) {
        try {
            let resp = [];
            let orderOffset = opts.orderOffset || 0;
            let forwardOffset = opts.forwardOffset || 0;
            //sort by order status
            let approvedOrders = orders.filter(order => order.status === OrderStatus.Approved);
            approvedOrders.sort((a,b) => a.createdAt < b.createdAt ? 1 : -1);
            let pendingOrders = orders.filter(order => [OrderStatus.Pending, OrderStatus.Denied].includes(order.status));
            pendingOrders.sort((a,b) => a.createdAt < b.createdAt ? 1 : -1);
            let beginForwardOrder = orderForwarders.filter(order => order.status === OrderForwarderStatus.Begin);
            beginForwardOrder.sort((a,b) => a.createdAt < b.createdAt ? 1 : -1);
            let otherOrder = orders.filter(order => ![OrderStatus.Approved, OrderStatus.Pending, OrderStatus.Denied].includes(order.status));
            otherOrder.sort((a,b) => a.createdAt < b.createdAt ? 1 : -1);
            let otherForwarderOrder = orderForwarders.filter(order => ![OrderForwarderStatus.Begin].includes(order.status));
            otherForwarderOrder.sort((a,b) => a.createdAt < b.createdAt ? 1 : -1);

            let limit = opts.limit || 10;

            for(let item of approvedOrders) {
                if(resp.length < limit) {
                    resp.push(item);
                    orderOffset++;
                } 
            }
            for(let item of pendingOrders) {
                if(resp.length < limit) {
                    resp.push(item);
                    orderOffset++;
                } 
            }
            for(let item of beginForwardOrder) {
                if(resp.length < limit) {
                    resp.push(await this.convertForwardDataToOrder(item.baseOrder, item, item.staff));
                    forwardOffset++;
                } 
            }
            for(let item of otherOrder) {
                if(resp.length < limit) {
                    resp.push(item);
                    orderOffset++;
                } 
            }
            for(let item of otherForwarderOrder) {
                if(resp.length < limit) {
                    resp.push(await this.convertForwardDataToOrder(item.baseOrder, item, item.staff));
                    forwardOffset++;
                } 
            }

            return {
                resp,
                orderOffset,
                forwardOffset
            };
        }
        catch (err) {
            console.error(err);
            return [...orders, ...orderForwarders];
        }
    }

    async convertForwardDataToOrder(order, forwardOrder, staff) {
        order.staff = staff;
        order.setDataValue("staff", staff);
        order.staffId = staff.id;
        order.setDataValue("staffId", staff.id);
        order.storeId = staff.storeId;
        order.setDataValue("storeId", staff.storeId);
        order.isForwardOrder = true;
        order.setDataValue("isForwardOrder", true);
        order.baseOrderId = order.id;
        order.setDataValue("baseOrderId", order.id);
        order.forwardOrderId = forwardOrder.id;
        order.setDataValue("forwardOrderId", forwardOrder.id);

        return order;
    }

    async scheduleChecker(timerTime) {
        try {
            let current = new Date();
            let time = !(timerTime instanceof Date) ? new Date(timerTime) : timerTime;
            if(!time) return false;
            if(time && time < new Date(current.getTime() + ScheduleOrderTimer)) return false;

            return true;
        }
        catch (err) {
            console.error(err);
            return false;
        }
    }
}

module.exports = {
    OrderHelper
}