const { PaymentMethod } = require("../../constants/constants");
const { OrderStatusInvalid, NotEnoughPermission, PaymentMethodNotValid } = require("../../constants/message")
const { OrderStatus } = require("../../constants/status");
const { sequelize } = require("../../model");
const { TransactionService } = require("../transaction/transactionService");
const Order = require("../../model").Order;
const Staff = require("../../model").Staff;
const User = require("../../model").User;

class OrderFinishService {
    transactionService;
    constructor() {
        this.transactionService = new TransactionService();
    }

    async adminFinish(id) {
        return await this.finish(id, true);
    }

    async finish(id, isAdmin) {
        let {order, staff, customerUser} = await this.prepare(id);
        if(!await this.validate(order)) return;

        if(!isAdmin) {
            if(order.staffId !== staff.id) throw NotEnoughPermission;
        }

        await this.updateOrder(order);
        await this.updateStaff(staff);
        await this.updateStaffWallet(staff, order);
        //noti
        await this.customerNoti(customerUser);
        await this.staffNoti(staff);
    }

    async updateOrder(order) {
        await order.update(
            {
                status: OrderStatus.Finished,
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

    async updateStaffWallet(staff, order) {
        let amount = order.totalPay - order.totalReceive;
        console.log("order", order.paymentMethodId);
        console.log("amount", amount);
        switch(order.paymentMethodId) {
            case PaymentMethod.Cash: {
                let trans;
                const t = await sequelize.transaction();
                try {
                    let walletUser = await this.transactionService.getWalletUser(staff.userId);
                    console.log("walletUser", walletUser)
                    trans = await this.transactionService.chargeWallet(
                        walletUser,
                        {
                            forUserId: walletUser.id,
                            content: "Tiền thu phí dịch vụ Glow Healthy",
                            orderId: order.id,
                            amount: amount,
                            totalMoney: walletUser.totalMoney - amount,
                            userCreate: walletUser.id,
                            add :false
                        },
                        t,
                        {
                            skipCheckNegative: true
                        }
                    );

                    await t.commit();
                }
                catch (err1) {
                    await t.rollback();
                }

                return trans;
            }
            case PaymentMethod.Wallet: {
                let trans;
                const t = await sequelize.transaction();
                try {
                    let walletUser = await this.transactionService.getWalletUser(staff.userId);
                    trans = await this.transactionService.topupWallet(
                        walletUser,
                        {
                            forUserId: walletUser.id,
                            content: `Bạn được cộng ${order.totalReceive} vào ví do hoàn thành đơn ${order.code}`,
                            orderId: order.id,
                            amount: order.totalReceive,
                            totalMoney: walletUser.totalMoney + order.totalReceive,
                            userCreate: walletUser.id,
                            add: true
                        },
                        t
                    );

                    await t.commit();
                }
                catch (err1) {
                    await t.rollback();
                }

                return trans;
            }
            default: {
                throw PaymentMethodNotValid;
            }
        }
    }

    async validate(order) {
        if(![OrderStatus.Approved, OrderStatus.Pending].includes(order.status)) throw OrderStatusInvalid;

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
    OrderFinishService
}