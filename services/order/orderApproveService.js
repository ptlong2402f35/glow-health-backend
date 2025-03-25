const { PaymentMethod } = require("../../constants/constants");
const { OrderStatusInvalid } = require("../../constants/message")
const { OrderStatus } = require("../../constants/status");
const { sequelize } = require("../../model");
const { TransactionService } = require("../transaction/transactionService");
const Order = require("../../model").Order;
const Staff = require("../../model").Staff;
const User = require("../../model").User;

class OrderApproveService {
    constructor() {
    }

    async approve(id) {
        let {order, staff, customerUser} = await this.prepare(id);
        if(!await this.validate(order)) return;

        await this.updateOrder(order, data);
        await this.updateStaff(staff);
        //noti
        await this.customerNoti(customerUser);
        await this.staffNoti(staff);
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

    async customerNoti() {

    }

    async staffNoti() {
        
    }
}

module.exports = {
    OrderApproveService
}