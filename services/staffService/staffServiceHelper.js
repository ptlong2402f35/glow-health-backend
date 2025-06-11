const Service = require("../../model").Service;
const StaffServicePrice = require("../../model").StaffServicePrice;
const Staff = require("../../model").Staff;
const StaffService = require("../../model").StaffService;
const ServiceGroup = require("../../model").ServiceGroup;
const util = require("util");

const defaultPrice = [
    {
        price: 0,
        unit: "60 phút",
    },
    {
        price: 0,
        unit: "120 phút",
    }
]

class StaffServiceHelper {
    constructor() {}

    async getDefaultFormat(staffServices = []) {
        let services = await Service.findAll(
            {
                order: [["name", "asc"]],
                include: [
                    {
                        model: ServiceGroup,
                        as: "serviceGroup"
                    }
                ]
            }
        );
        let nservices = services.map(item =>({ 
            ...item.dataValues,
            serviceGroup: {
                ...item.serviceGroup?.dataValues || {}
            }
        }));
        console.log("services", nservices);
        let res = [];
        if(staffServices?.length) {
            for(let service of nservices) {
                let exist = staffServices.find(item => item?.serviceId === service.id);
                if(exist) {
                    res.push(
                        {
                            ...service,
                            name: exist.name,
                            description: exist.description,
                            code: exist.code,
                            price: exist.prices.length ? exist.prices.map(item => item.dataValues).filter(val => val) : defaultPrice.map(item => ({...item, staffServiceId: exist.id, serviceGroupId: exist.serviceGroupId}))
                        }
                    );
                    
                    continue;
                }
                res.push(
                    {
                        ...service,
                        price: [
                            
                        ]
                    }
                );
            }
        }
        else {
            res = [...nservices].map(item => ({
                ...item,
                prices: []
            }));
        }
        console.log("services", util.inspect(res, false, null, true));

        return this.groupAndSortWithServiceGroup(res);
    }

    groupAndSortWithServiceGroup(services) {
        let resp = [];
        for(let item of services) {
            let exist = resp.find(el => el.name === item.serviceGroup.name);
            if(exist) {
                exist.services.push(item);
                continue;
            }

            if(item.serviceGroup.id) {
                resp.push(
                    {
                        ...item.serviceGroup,
                        services: [
                            {...item}
                        ]
                    }
                );
            }
        }

        return resp;
    }

    buildStaffServiceData(data) {
        return {
            ...(data.name? {name: data.name} : {}),
            ...(data.code? {code: data.code} : {}),
            ...(data.active? {active: data.active} : {}),
            ...(data.description? {description: data.description} : {}),
            ...(data.serviceGroupId? {serviceGroupId: data.serviceGroupId} : {}),
            ...(data.staffId? {staffId: data.staffId} : {}),
            ...(data.serviceI? {serviceId: data.serviceId} : {})
        }
    }

    buildStaffServicePriceData(data) {
        return {
            ...(data.staffServiceId? {staffServiceId: data.staffServiceId} : {}),
            ...(data.price? {price: data.price} : {}),
            ...(data.unit? {unit: data.unit} : {}),
            ...(data.serviceGroupId? {serviceGroupId: data.serviceGroupId} : {}),
            ...(data.staffId? {staffId: data.staffId} : {}),
        }
    }

    async staffUpdateHandler(staffId) {
        let staff = await Staff.findOne({
            where: {
                id: staffId
            },
            include: [
                {
                    model: StaffService,
                    as: "staffServices"
                }
            ]
        });
        await staff.update({
            serviceIds: [...new Set(staff.staffServices.map(item => item.serviceId) || [])],
            serviceGroupIds: [...new Set(staff.staffServices.map(item => item.serviceGroupId) || [])],
        })
    }
}

module.exports = {StaffServiceHelper}