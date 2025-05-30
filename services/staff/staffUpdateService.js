const { StaffCreateService } = require("./staffCreateService");
const Staff = require("../../model").Staff;
const User = require("../../model").User;

class StaffUpdateService {
    staffCreateService;
    constructor() {
        this.staffCreateService = new StaffCreateService();
    }

    async updateMyStaffDetail(data, userId) {
        let bData = this.staffCreateService.build(data);

        await Staff.update(
            {
                ...bData
            },
            {
                where: {
                    userId
                }
            }
        );

        if(data.urlImage) {
            await User.update(
                {
                    urlImage: data.urlImage
                },
                {
                    where: {
                        id: userId
                    }
                }
            );
        }

    }

    async ownerUpdateStaffDetail(data, id) {
        let bData = this.staffCreateService.build(data);

        await Staff.update(
            {
                ...bData
            },
            {
                where: {
                    id
                }
            }
        );
    }

    
}

module.exports = {
    StaffUpdateService
}