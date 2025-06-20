const { Op } = require("sequelize");
const { UserNotFound, ExistedPhone, PasswordEmpty, PasswordNotMatch } = require("../constants/message");
const { UserRole } = require("../constants/roles");
const { AuthService } = require("../services/auth/authService");
const { ErrorService } = require("../services/errorService");
const User = require("../model").User;
const Staff = require("../model").Staff;
const DefaultUserPassword = process.env.DEFAULT_USER_PASSWORD?.trim() || "";
var bcrypt = require("bcryptjs");
const { sequelize } = require("../model");
const { PusherConfig } = require("../pusher/pusherConfig");
const { CommunicationService } = require("../services/communication/communicationService");

class UserController {

    adminCreateUser = async (req, res, next) => {
        const authService = new AuthService();
        try {
            let data = req.body;
            
            let checkPhoneExist = await authService.checkPhoneExist(data.phone);
            if(checkPhoneExist) throw ExistedPhone;

            data.password = DefaultUserPassword;
            data.role = UserRole.Customer;

            await authService.handleCustomerSignup(data);

            return res.status(200).json({message: "Done"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminGetUser = async (req, res, next) => {
        try {
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 50;
            let phone = req.query.phone || null;
            let search = [
                {
                    id: {
                        [Op.ne]: 1
                    }
                }
            ];
            if(phone) {
                search.push({ phone : { [Op.iLike]: `%${phone}%` }});
            }

            let data = await User.paginate({
                page,
                paginate: perPage,
                where: {
                    [Op.and]: search
                },
                order: [["id", "desc"]],
            });

            data.currentPage = page;

            return res.status(200).json(data);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminGetUserDetail = async (req, res, next) => {
        try {
            let userId = req.params.id ? parseInt(req.params.id) : null;
            
            let user = await User.findByPk(userId);

            return res.status(200).json(user);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    updatePassword = async (req, res, next) => {
        try {
            let userId = req.user.userId;
            let data = req.body;
            if(!data.password || !data.oldPassword) throw PasswordEmpty;

            let user = await User.findByPk(userId);
            let checkPass = bcrypt.compareSync(data.oldPassword, user.password);
            if(!checkPass) throw PasswordNotMatch;
            let passHashed = bcrypt.hashSync(data.password, 10);
            await user.update(
                {
                    password: passHashed,
                }
            );
            
            return res.status(200).json({message: "DONE"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    getMyUserDetail = async (req, res, next) => {
        try {
            let userId = req.user.userId;
            
            let user = await User.findByPk(userId);

            return res.status(200).json(user);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminUnactiveUser = async (req, res, next) => {
        const authService = new AuthService();
        try {
            let userId = req.params.id ? parseInt(req.params.id) : null;
            let active = req.body.active;

            await User.update(
                {
                    active: active
                },
                {
                    where: {
                        id: userId
                    }
                }
            );

            return res.status(200).json({message: "Done"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    updateUserInfo = async (req, res, next) => {
        try {
            let userId = req.user.userId;
            let data = req.body;
            
            let [count] = await User.update(
                {
                    ...data      
                },
                {
                    where: {
                        id: userId
                    }
                }
            );

            return res.status(200).json({message: "Done"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminUpdateUserInfo = async (req, res, next) => {
        try {
            let userId = req.params.id ? parseInt(req.params.id) : null;
            let data = req.body;
            
            let [count] = await User.update(
                {
                    ...data      
                },
                {
                    where: {
                        id: userId
                    }
                }
            );

            return res.status(200).json({message: "Done"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    unactiveAccount = async (req, res, next) => {
        try {
            let userId = req.user.userId;
            let active = req.body.active;
            
            let user = await User.findByPk(userId);
            if(!user) throw UserNotFound;
            await user.update(
                {
                    active
                }
            );

            return res.status(200).json({message: "Done"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    updateMyLocation = async (req, res, next) => {
        try {
            let userId = req.user.userId;
            let lat = req.body.lat;
            let long = req.body.long;
            if(!lat || !long) return res.status(200).json({message: "Done"}); 

            console.log("lat", lat);
            console.log("long", long);

            let user = await User.findByPk(userId);
            if(!user) throw UserNotFound;
            await user.update(
                {
                    userCoordinate: sequelize.fn("ST_MakePoint", long, lat)
                }
            );

            if(user.role === UserRole.Staff) {
                await Staff.update(
                    {
                        lat: lat,
                        long,
                        coordinate: sequelize.fn("ST_MakePoint", long, lat),
                    },
                    {
                        where: {
                            userId: userId
                        }
                    }
                );
            }

            return res.status(200).json({message: "Done"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    updateExpoToken = async (req, res, next) => {
        try {
            let userId = req.user.userId;
            let token = req.body.token;

            await User.update(
                {
                    expoToken: null
                },
                {
                    where: {
                        expoToken: token
                    }
                }
            );
            await User.update(
                {
                    expoToken: token
                },
                {
                    where: {
                        id: userId
                    }
                }
            );


            return res.status(200).json({message: "Done"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    testPusherNoti = async (req, res, next) => {
        try {
            let id = req.params.id ? parseInt(req.params.id): 3;
            const pusherConfig = new PusherConfig().getInstance();
            try {
                pusherConfig.trigger({reload: true}, `pusher-channel-${id}`, "reload-detail-order");
            }
            catch (err) {
                console.error(err);
            }

            return res.status(200).json({message: "Done"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    testPusherNotiMobile = async (req, res, next) => {
        try {
            let id = req.params.id ? parseInt(req.params.id): 3;
            const pusherConfig = new PusherConfig().getInstance();
            await new CommunicationService().sendMobileNotification(id, "Test Noti", "Test thành công");

            return res.status(200).json({message: "Done"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }
}

module.exports = new UserController();