const { ExistedPhone } = require("../../constants/message");
const { UserRole } = require("../../constants/roles");
const { sequelize } = require("../../model");
const { AuthService } = require("../auth/authService");
const DefaultStaffPassword = "123456";

const Staff = require("../../model").Staff;

class StaffCreateService {
    authService;
    constructor() {
        this.authService = new AuthService();
    }

    async adminCreateStaff(data) {
        try {
            let checkPhoneExist = await this.authService.checkPhoneExist(data.phone);
            if(checkPhoneExist) throw ExistedPhone;
            let staff;

            let t = await sequelize.transaction();
            try {
                await this.createUser(data, t);
                staff = await this.createStaff(data, t);
                await t?.commit();

            }
            catch (err) {
                await t?.rollback();
                throw err;
            }
            
            return staff;
        }
        catch (err) {
            throw err;
        }
    }

    async createStaff(data, t) {
        try {
            let builtData = this.build(
                {
                    ...data,
                    active: true,
                    busy: false,
                }
            );
    
            await Staff.create(
                builtData,
                {
                    ...(t ? {transaction: t} : {})
                }
            );
        }
        catch (err) {
            throw err;
        }
    }

    async createUser(data, t) {
        try {
            await this.authService.handleCustomerSignup(
                {
                    ...data,
                    password: DefaultStaffPassword,
                    role: UserRole.Staff
                },
                t
            );
        }
        catch (err) {
            throw err;
        }
    }


    build(data) {
        return {
            name: data.name,
            userId: data.userId,
            age: data.age,
            gender: data.gender,
            images: data.images,
            active: data.active,
            address: data.address,
            lat: data.lat,
            long: data.long,
            coordinate: data.coordinate,
            online: data.online,
            description: data.description,
            storeId: data.storeId,
            staffRole: data.staffRole,
            busy: data.busy,
            provinceId: data.provinceId,
            districtId: data.districtId,
            communeId: data.communeId,
            rateAvg: data.rateAvg,
            countReview: data.countReview,
            type: data.type,
            serviceIds: data.serviceIds,
            serviceGroupIds: data.serviceGroupIds,
        }
    }
}

module.exports = {
    StaffCreateService
}