const { LocationConfig } = require("../configService/locationConfig");
const util = require("util");

class StaffDisplayHandler {
    locationConfig;
    constructor() {
        this.locationConfig = new LocationConfig().getInstance();
    }

    attachProvinceInfo(staff) {
        try {
            if(!staff) return;
            let province = this.locationConfig.getProvinceInfo(staff.provinceId);

            staff.province = province;
            staff?.setDataValue("province", province);
        }
        catch (err) {
            console.error(err);
        }
    }

    sortAndGroupStaffService(staff, staffServices) {
        let resp = [];
        for(let item of staffServices) {
            let exist = resp.find(el => el.id === item.serviceGroupId);
            if(exist) {
                exist.staffServices.push({...item.dataValues});
                continue;
            }

            if(item.serviceGroup.id) {
                resp.push(
                    {
                        ...item.serviceGroup.dataValues,
                        staffServices: [
                            {...item.dataValues}
                        ]
                    }
                );
            }
        }

        if(resp) {
            staff.serviceGroupTree = resp;
            staff.setDataValue("serviceGroupTree", resp);
        }

        console.log("resp", util.inspect(resp, false, null, true));

        return resp;
    }
}

module.exports = {
    StaffDisplayHandler
}