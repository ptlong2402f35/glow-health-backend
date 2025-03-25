const { Op } = require("sequelize");

const StaffServicePrice = require("../../model").StaffServicePrice;
const Vourcher = require("../../model").Vourcher;

class PriceHelper {
    factors;
    servicePriceFactory;
    vourcherFactory;
    constructor() {
        this.factors = [new ServicePriceFactory, new VourcherFactory];
        this.servicePriceFactory = new ServicePriceFactory();
        this.vourcherFactory = new VourcherFactory();
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

        let vourchers = await this.vourcherFactory.fetch([data.vourcherId]);
        price.reduce = await this.vourcherFactory.getTotal(vourchers);

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

class VourcherFactory {
    constructor() {}

    async fetch(ids) {
        if(!ids) return [];
        let vourchers = await Vourcher.findAll(
            {
                where: {
                    id:{
                        [Op.in]: ids
                    }
                }
            }
        );

        return vourchers;
    }

    getTotal() {
        let total = prices.reduce((acc ,cur) => acc + (cur.reduceValue || 0), 0);
        return total;
    }
}

module.exports = {
    PriceHelper,
    ServicePriceFactory,
    VourcherFactory
}