const Service = require("../../model").Service;
const StaffServicePrice = require("../../model").StaffServicePrice;

class StaffServiceHelper {
    constructor() {}

    async getDefaultFormat(staffServices = []) {
        let services = await Service.findAll(
            {
                order: [["name", "asc"]],
            }
        );
        let res = [];
        if(staffServices) {
            for(let service of services) {
                let exist = staffServices.findOne(item => item?.serviceId === service.id);
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
            res = [...services];
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
            serviceGroup: data.serviceGroup,
        }
    }
}

module.exports = {StaffServiceHelper}