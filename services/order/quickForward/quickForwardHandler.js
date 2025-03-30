const { QuickForwardConfig } = require("./quickForwardConfig");
const Order = require("../../../model").Order;

class QuickForwardHandler {
    quickForwardConfig;
    constructor() {
        this.quickForwardConfig = new QuickForwardConfig().getInstance();
    }

    async applyStaffForQuickForwardOrder(order, staff) {
        return await Order.update(
            {
                staffId: staff.id,
                storeId: staff.storeId
            },
            {
                where: {
                    id: order.id
                }
            }
        );
    }
}

module.exports = {
    QuickForwardHandler
}