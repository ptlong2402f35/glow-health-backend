
const CustomerAddress = require("../../../model").CustomerAddress;
const Province = require("../../../model").Province;
const District = require("../../../model").District;
const Commune = require("../../../model").Commune;
const Voucher = require("../../../model").Voucher;
const crypto = require("crypto");
const util = require("util");
const { PriceHelper } = require("../priceHelper");
const { OrderHelper } = require("../orderHelper");
const { OrderStatus } = require("../../../constants/status");
const { OrderType } = require("../../../constants/type");
const { Op } = require("sequelize");
const ForwardStaffDuration = process.env.FORWARD_STAFF_DURATION || 1000 * 60 * 60; // 60 minutes

class OrderCreateBuilder {
    priceHelper;
    orderHelper;
    constructor() {
        this.priceHelper = new PriceHelper();
        this.orderHelper = new OrderHelper();
    }

    async defaultBuilder(data, staff, userCustomer, { isQuickForward} = {}) {
        try {
            let address = await this.buildAddress(data.addressId, staff, userCustomer);
            let orderLat = address.lat ? address.lat : null;
            let orderLong = address.long ? address.long : null;
            let orderCode = this.generateCode();
            let {money, voucher, ssprices} = await this.buildMoneyData(
                data
            );

            console.log("money", money);
			let current = new Date();
            let forwardExpiredAt = new Date(current.getTime() + ForwardStaffDuration);
			
            let builtData = this.build(
                data, 
                staff, 
                userCustomer,
                {
                    address,
                    orderLat,
                    orderLong,
                    orderCode,
                    money,
                    forwardExpiredAt,
                    voucher,
                    ssprices
                },
                {isQuickForward}
            );

            return {
                dataOrder: builtData,
                address,
                orderCode,
                money,
                ssprices
            };
        }
        catch (err) {
            console.error(err);
            return null;
        }
    }

    async buildAddress(addressId, staff, userCustomer, {isStoreOrder} = {}) {
        try {
            var address = {};
			if (addressId) {
				address = await CustomerAddress.findOne({
					where: { id: addressId },
				});
				address = address ? address : {};
			}

            return address;
        }
        catch (err) {
            console.error(err);
            return {};
        }
    }

    generateCode() {
        const string = crypto.randomBytes(8).toString("hex");
		return string.toUpperCase();
    }

    buildTimeData(dataTime, key = "", name = "", value = "") {
        try {
			var data = dataTime ? JSON.parse(dataTime) : [];
			data.push({ key, name, value });
			return JSON.stringify(data);
		} catch (error) {
			return dataTime;
		}
    }

    async buildMoneyData(data) {
        try {
            let voucherIds = [];
            let voucher;
            let current = new Date();
            if (data.voucherCode) {
                voucher = await Voucher.findOne({
                    where: { 
                        code: {
                            [Op.iLike]: data.voucherCode
                        },
                        startAt: {
                            [Op.lte]: current
                        },
                        endAt: {
                            [Op.gte]: current
                        }
                    },
                });
                console.log("voucher apply ===", voucher.id);
                voucherIds.push(voucher.id);
            }
            let money =  await this.priceHelper.calcOrderFee({
                staffServicePriceIds: data.staffServicePriceIds,
                voucherId: voucherIds[0],
            });
            let ssprices = await this.priceHelper.getStaffServicePrices(data.staffServicePriceIds);

            return {
                money,
                voucher,
                ssprices
            }
        }
        catch (err) {
            console.error(err);
            return {};
        }
    }

    build(
        data, 
        staff, 
        user,
        {
            address,
            orderLat,
            orderLong,
            orderCode,
            money,
            forwardExpiredAt,
            voucher,
            ssprices
        } = {},
        {
            isQuickForward, 
        } = {}) {
        let isScheduleOrder = this.orderHelper.scheduleChecker(data.timerTime);

        let booking = ssprices.map(item => (
                {
                ...item.dataValues,
                staffService: {...item.staffService.dataValues}
            }
        ));

        return {
            staffId: data.staffId,
            voucherId: money.voucherId,
            total: money.total,
            fee: money.fee,
            totalPay: money.totalPay,
            totalReceive: money.totalReceive,
            timeAdditionalFee : money.timeAdditionalFee,
            provinceId: address?.provinceId || 0,
            districtId: address?.districtId || 0,
            communeId: address?.communeId || 0,
            address: address && address.address ? address.address : null,
            lat: orderLat,
            long: orderLong,
            status: OrderStatus.Pending,
            customerUserId: user.id,
            paymentMethodId: data.paymentMethodId,
            code: orderCode,
            note: data.note,
            ...(data.timerTime ? { timerTime: new Date(data.timerTime) } : {timerTime: new Date()}),
            type: isQuickForward ? OrderType.QuickForward : OrderType.Normal,
            storeId: staff.storeId,
            expiredAt: forwardExpiredAt,
            earningRate: money.earningRate,
            forwardFromOrderId: data.forwardFromOrderId,
            staffServicePriceIds: data.staffServicePriceIds,
            voucherId: voucher?.id,
            customerAddres: address,
            serviceBooking: booking || []
        }
    }
}

module.exports = {
    OrderCreateBuilder
}