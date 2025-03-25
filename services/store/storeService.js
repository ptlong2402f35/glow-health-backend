const { StaffRole } = require("../../constants/roles");

const Store = require("../../model").Store;
const Staff = require("../../model").Staff;

class StoreService {
    constructor() {}

    async removeStoreHandler(id) {
        try {
            if(!id) return;
            await Staff.update(
                {
                    storeId: null,
                    staffRole: StaffRole.Individual
                },
                {
                    where: {
                        storeId: id
                    }
                }
            );

            
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = {
    StoreService
}