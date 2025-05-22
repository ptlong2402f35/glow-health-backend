const { LocationConfig } = require("../configService/locationConfig");


class StaffDisplayHandler {
    locationConfig;
    constructor() {
        this.locationConfig = new LocationConfig().getInstance();
    }

    attachProvinceInfo(staff) {
        try {
            if(!staff) return;
            let province = this.locationConfig.getProvinceInfo();

            staff.province = province;
            staff?.setDataValue("province", province);
        }
        catch (err) {
            console.error(err);
        }
    }
}

module.exports = {
    StaffDisplayHandler
}