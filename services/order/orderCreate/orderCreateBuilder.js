
const CustomerAddress = require("../../../model").CustomerAddress;
const Province = require("../../../model").Province;
const District = require("../../../model").District;
const Commune = require("../../../model").Commune;
const Vourcher = require("../../../model").Vourcher;
const crypto = require("crypto");
const util = require("util");
const { PriceHelper } = require("../priceHelper");
const { OrderHelper } = require("../orderHelper");
const { OrderStatus } = require("../../../constants/status");
const { OrderType } = require("../../../constants/type");
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
            let {money, vourcher} = await this.buildMoneyData(
                data
            );
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
                    vourcher
                },
                {isQuickForward}
            );

            return {
                dataOrder: builtData,
                address,
                orderCode,
                money,
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
					include: [
						{
							model: Province,
							as: "province",
							attributes: ["id", "name"],
						},
						{
							model: District,
							as: "district",
							attributes: ["id", "name"],
						},
						{
							model: Commune,
							as: "commune",
							attributes: ["id", "name"],
						},
					],
				});
				address = address ? address : {};
			}
			if (isStoreOrder) {
				address = await this.addressService.getAddressStoreStation(staff, userCustomer);
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
            let vourcherIds = [];
            let vourcher;
            if (data.voucherCode) {
                vourcher = await Vourcher.findOne({
                    where: { code: data.voucherCode },
                });
                vourcherIds.push(vourcher.id);
            }
            let money =  await this.priceHelper.calcOrderFee({
                staffServicePriceIds: data.staffServicePriceIds,
                vourcherId: vourcherIds[0],
            });

            return {
                money,
                vourcher
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
            vourcher
        } = {},
        {
            isQuickForward, 
        } = {}) {
        let isScheduleOrder = this.orderHelper.scheduleChecker(data.timerTime);

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
            ...(data.timerTime && { timerTime: new Date(data.timerTime) }),
            fromForwardOrderId: data.fromForwardOrderId,
            type: isQuickForward ? OrderType.QuickForward : OrderType.Normal,
            storeId: staff.storeId,
            expiredAt: forwardExpiredAt,
            earningRate: money.earningRate,
            forwardFromOrderId: data.forwardFromOrderId,
            staffServicePriceIds: data.staffServicePriceIds,
            vourcherId: vourcher.id,
        }
    }
}

module.exports = {
    OrderCreateBuilder
}