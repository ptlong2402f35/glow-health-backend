const Service = require("../../model").Service;
const StaffServicePrice = require("../../model").StaffServicePrice;
const Staff = require("../../model").Staff;
const StaffService = require("../../model").StaffService;
const ServiceGroup = require("../../model").ServiceGroup;

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
                            price: exist.prices.map(item => item.dataValues).filter(val => val)
                        }
                    );
                    
                    continue;
                }
                res.push(
                    {
                        ...service,
                        prices: []
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

            resp.push(
                {
                    ...item.serviceGroup,
                    services: [
                        {...item}
                    ]
                }
            )
        }

        return resp;
    }

    buildStaffServiceData(data) {
        return {
            name: data.name,
            code: data.code,
            active: data.active,
            description: data.description,
            serviceGroupId: data.serviceGroupId,
            staffId: data.staffId,
            serviceId: data.serviceId
        }
    }

    buildStaffServicePriceData(data) {
        return {
            staffServiceId: data.staffServiceId,
            price: data.price,
            unit: data.unit,
            serviceGroupId: data.serviceGroupId,
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