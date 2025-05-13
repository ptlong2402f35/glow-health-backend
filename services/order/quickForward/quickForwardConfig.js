const StaffQuickForwardConfigId = process.env.STAFF_QUICK_FORWARD_CONFIG_ID ? parseInt(process.env.STAFF_QUICK_FORWARD_CONFIG_ID) : 5;
const Staff = require("../../../model").Staff;
const User = require("../../../model").User;

const { Op } = require("sequelize");
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
        this.bannerConfig = BannerConfig.map(item => (
            {
                ...item
            }
        ));

        let pinnedStaffIds = [];
        for(let config of this.bannerConfig) {
            pinnedStaffIds.push(...(config.pinnedStaff.map(item => item.id).filter(val => val) || []));
        }
        console.log("pinnedStaffIds ===", pinnedStaffIds);
        this.staffConfigs = await Staff.findAll(
            {
                where: {
                    id: {
                        [Op.in]: pinnedStaffIds
                    }
                }
            }
        );

        for(let config of this.bannerConfig) {
            if(!config.pinnedStaff) continue;
            config.pinnedStaff = config.pinnedStaff.map( item => (
                {
                    ...item,
                    staff: this.staffConfigs.find(cfg => cfg.id === item.id), 
                }
            ));
        }
    }

    async getConfigById(id) {
        try {
            if(!id) return {};
            return [...this.bannerConfig].find(item => item.id === id);
        }
        catch (err) {
            console.error(err);
        }
    }

    async getPinnedStaff() {
        try {
            let resp = [];
            for(let item of this.bannerConfig) {
                if(!item.pinnedStaff) continue;
                resp.push(...item.pinnedStaff);
            }

            return resp;
        }
        catch (err) {
            console.error(err);
        }
    }
}

module.exports = {
    QuickForwardConfig
}