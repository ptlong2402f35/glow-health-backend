const Service = require("../model").Service;
const ServiceGroup = require("../model").ServiceGroup;

class ServiceConfig {
    static instance;
    serviceTree;
    constructor () {
    }

    getInstance() {
		if (!ServiceConfig.instance) {
			ServiceConfig.instance = new ServiceConfig();
		}
		return ServiceConfig.instance;
	}

    async init() {
        try {
            let serviceGroups = await ServiceGroup.findAll({
                order: [["name", "asc"]]
            });

            let services = await Service.findAll({
                order: [["name", "asc"]]
            });
            let res = [];
            for(let group of serviceGroups) {
                let rawGroup = {...group.dataValues};
                let aServices = services.filter(service => service.groupId === rawGroup.id).map(item => ({...item.dataValues}));
            }
        }
        catch (err) {
            console.error(err);
        }
    }
}

exports.module = {
    ServiceConfig
}