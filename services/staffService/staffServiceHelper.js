const Service = require("../../model").Service;
const StaffServicePrice = require("../../model").StaffServicePrice;
const Staff = require("../../model").Staff;
const StaffService = require("../../model").StaffService;

class StaffServiceHelper {
    constructor() {}

    async getDefaultFormat(staffServices = []) {
        let services = await Service.findAll(
            {
                order: [["name", "asc"]],
            }
        );
        services = services.map(item => item.dataValues);
        let res = [];
        if(staffServices?.length) {
            for(let service of services) {
                let exist = staffServices.find(item => item?.serviceId === service.id);
                if(exist) {
                    res.push(exist);
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
            res = [...services].map(item => ({
                ...item,
                prices: []
            }));
        }

        return res;
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