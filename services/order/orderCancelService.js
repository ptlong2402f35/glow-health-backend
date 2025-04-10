const { PaymentMethod } = require("../../constants/constants");
const { OrderStatusInvalid, NotOwnerOrder } = require("../../constants/message")
const { OrderStatus, OrderForwarderStatus } = require("../../constants/status");
const { sequelize } = require("../../model");
const { TransactionService } = require("../transaction/transactionService");
const Order = require("../../model").Order;
const Staff = require("../../model").Staff;
const User = require("../../model").User;
const OrderForwarder = require("../../model").OrderForwarder;

class OrderCancelService {
    constructor() {
    }

    async customerCancel(data, id) {
        let {order, staff, customerUser} = await this.prepare(id);
        if(data.userId != customerUser.id) throw NotOwnerOrder;
        if(!await this.validate(order, true)) return;

        await this.updateOrder(order, data);
        await this.updateOrderForwarder(order.id);
        //noti
        await this.customerNoti(customerUser);
        await this.staffNoti(staff);
    }

    async cancel(data, id) {
        let {order, staff, customerUser} = await this.prepare(id);
        if(!await this.validate(order)) return;

        await this.updateOrder(order, data, true);
        await this.updateStaff(staff);
        //noti
        await this.customerNoti(customerUser);
        await this.staffNoti(staff);
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

    async customerNoti() {

    }

    async staffNoti() {
        
    }
}

module.exports = {
    OrderCancelService
}