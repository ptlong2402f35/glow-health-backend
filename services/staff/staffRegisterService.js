const { UserRole } = require("../../constants/roles");
const { sequelize } = require("../../model");
const { StaffCreateService } = require("./staffCreateService");
const User = require("../../model").User;

class StaffRegisterService {
    staffCreateService;
    constructor() {
        this.staffCreateService = new StaffCreateService();
    }

    async registerStaffByCustomer(data, userId) {
        try {
            let transaction = await sequelize.transaction();
            let staff = await this.createStaffInstance(data, transaction);
            await this.updateUserRole(userId, data, transaction);
            await transaction?.commit();

            return staff;
        }
        catch (err) {
            await transaction?.rollback()
            throw err;
        }
    }

    async createStaffInstance(data, t) {
        return await this.staffCreateService.createStaff(data, t);
    }

    async updateUserRole(userId, data,  transaction) {
        try {
            await User.update(
                {
                    role: UserRole.Staff,
                    ...(data?.urlImage ? {urlImage: data.urlImage} : {}),
                },
                {
                    where: {
                        id: userId
                    },
                    ...(transaction ? {transaction} : {}),
                }
            )
        }
        catch (err) {
            throw err;
        }
    }

}

module.exports = {
    StaffRegisterService
}