const StaffQuickForwardConfigId = process.env.STAFF_QUICK_FORWARD_CONFIG_ID ? parseInt(process.env.STAFF_QUICK_FORWARD_CONFIG_ID) : 5;
const Staff = require("../../../model").Staff;
const User = require("../../../model").User;

const BannerConfig = require("../../../resources/bannerConfig.json");

class QuickForwardConfig {
    static instance;
    bannerConfig;
    staffConfigs;
    constructor() {
        
    }

    getInstance() {
        if(!QuickForwardConfig.instance) {
            QuickForwardConfig.instance = new QuickForwardConfig();
        }
        return QuickForwardConfig.instance;
    }

    async init() {
        this.staffConfigs = await Staff.findByPk(
            StaffQuickForwardConfigId,
        );

        this.bannerConfig = BannerConfig.map(item => (
            {
                ...item
            }
        ));

        for(let config of this.bannerConfig) {
            if(!config.quickStaffService) continue;
            config.quickStaffService = config.quickStaffService.map( item => (
                {
                    ...item,
                    detailStaff: {...this.staffConfigs.dataValues}, 
                }
            ))
        }
    }


}

module.exports = {
    QuickForwardConfig
}