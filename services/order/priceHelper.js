const { Op } = require("sequelize");

const StaffServicePrice = require("../../model").StaffServicePrice;
const Voucher = require("../../model").Voucher;

class PriceHelper {
    factors;
    servicePriceFactory;
    voucherFactory;
    constructor() {
        this.factors = [new ServicePriceFactory, new VoucherFactory];
        this.servicePriceFactory = new ServicePriceFactory();
        this.voucherFactory = new VoucherFactory();
    }

    async calcOrderFee(data) {
        let price = {
            total: 0,
            totalPay: 0,
            fee: 0,
            earningRate: 0.75,
            totalReceive: 0,
            reduce: 0,
            timeAdditionalFee: 0,
        }
        let ssPrices = await this.servicePriceFactory.fetch(data.staffServicePriceIds);
        price.total = await this.servicePriceFactory.getTotal(ssPrices);

        let vouchers = await this.voucherFactory.fetch([data.voucherId]);
        price.reduce = await this.voucherFactory.getTotal(vouchers);

        price.totalPay = price.total - price.reduce;
        price.totalReceive = price.total * price.earningRate;
        
        return price;
    }
}

class ServicePriceFactory {
    price;
    constructor() {
        this.price = {
            total: 0,
            totalPay: 0,
            fee: 0,
            earningRate: 0.75,
            totalReceive: 0,
        }
    }

    async fetch(ids) {
        if(!ids) return [];
        let prices = await StaffServicePrice.findAll(
            {
                where: {
                    id:{
                        [Op.in]: ids
                    }
                }
            }
        );
        
        return prices;
    }

    getTotal(prices) {
        let total = prices.reduce((acc ,cur) => acc + (cur.price || 0), 0);
        return total;
    }
}

class VoucherFactory {
    constructor() {}

    async fetch(ids) {
        if(!ids) return [];
        let vouchers = await Voucher.findAll(
            {
                where: {
                    id:{
                        [Op.in]: ids
                    }
                }
            }
        );

        return vouchers;
    }

    getTotal(prices) {
        let total = prices.reduce((acc ,cur) => acc + (cur.reduceValue || 0), 0);
        return total;
    }
}

module.exports = {
    PriceHelper,
    ServicePriceFactory,
    VoucherFactory
}