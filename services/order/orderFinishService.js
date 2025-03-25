const { PaymentMethod } = require("../../constants/constants");
const { OrderStatusInvalid } = require("../../constants/message")
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

    async finish(id) {
        let {order, staff, customerUser} = await this.prepare(id);
        if(!await this.validate(order)) return;

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
        switch(order.paymentMethodId) {
            case PaymentMethod.Cash: {
                let trans;
                const t = await sequelize.transaction();
                try {
                    let walletUser = await this.transactionService.getWalletUser(staff.userId);
                    trans = await this.transactionService.chargeWallet(
                        walletUser,
                        {
                            forUserId: walletUser.id,
                            content: "Tiền thu phí dịch vụ Glow Healthy",
                            orderId: order.id,
                            money: amount,
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
                            money: order.totalReceive,
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