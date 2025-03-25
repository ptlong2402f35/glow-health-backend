const { NotEnoughPermission } = require("../../../constants/message");
const { StaffRole } = require("../../../constants/roles");

const Store = require("../../../model").Store;
const Staff = require("../../../model").Staff;
const User = require("../../../model").User;



class OwnerService {
    constructor() {}

    async getStoreStaff(userId, conds) {
        try {
            let storeStaff = await this.validatePermission(userId);

            if(!storeStaff) throw NotEnoughPermission;
            let staffs = await Staff.findAll(
                {
                    where: {
                        storeId: storeStaff.storeId,
                        staffRole: StaffRole.Individual,
                        ...(conds ? {...conds} : {})
                    }
                }
            );

            return staffs;
        }
        catch (err) {
            throw(err);
        }
    }

    async validatePermission(userId) {
        let storeStaff = await Staff.findOne(
            {
                where: {
                    userId,
                    staffRole: StaffRole.OwnerStation
                }
            }
        );

        if(!storeStaff) throw NotEnoughPermission;
        return storeStaff;
    }

}

module.exports = {
    OwnerService
}