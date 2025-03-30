const User = require("../model").User;
const Staff = require("../model").Staff;
const util = require("util");
const { AuthService } = require("../services/auth/authService");
const {AuthLogin} = require("../services/auth/authLogin"); 
const { EmailEmpty, PasswordEmpty, InputInfoEmpty, ConfirmPasswordNotMatch, ExistedEmail, ExistedPhone, UserNotFound, EmailFormatNotValid, PhoneFormatNotValid, UserPhoneEmpty } = require("../constants/message");
const { ErrorService } = require("../services/errorService");
const { Validation } = require("../utils/validation");
const { TranslateService } = require("../services/translateService");
const SuccessRespMessage = require("../resources/translation.json").message.done;
const config = require("../config/config");
const { FirebaseConfig } = require("../firebase/firebaseConfig");
const { UserRole } = require("../constants/roles");

class AuthController {
    login = async (req, res, next) => {
        try {
            let data = req.body;
            data.phone = data.phone?.trim()?.toLowerCase();
            if(!data.phone) {
                throw UserPhoneEmpty;
            }
            if(!data.password) {
                throw PasswordEmpty;
            }
            let {action, accessToken, refreshToken, expiredIn, userId} = await new AuthLogin().handleLogin(data);
            if(action) {
                return res.status(200).json({
                    message: "Đăng nhập thành công",
                    accessToken,
                    expiredIn,
                    userId,
                    refreshToken,
                    
                });
            }
            return res.status(403).json({
                message: "Đăng nhập thất bại",
                accessToken: null,
                expiredIn: null,
                userId: null,
                refreshToken: null,
            });
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    loginForDev = async (req, res, next) => {
        try {
            let data = req.body;
            data.userName = data.userName?.trim()?.toLowerCase();
            if(!data.userName) {
                throw UserPhoneEmpty;
            }
            if(!data.password) {
                throw PasswordEmpty;
            }
            let {action, accessToken, refreshToken, expiredIn, userId} = await new AuthLogin().handleLogin(data, true);
            if(action) {
                return res.status(200).json({
                    message: "Đăng nhập thành công",
                    accessToken,
                    expiredIn,
                    userId,
                    refreshToken,
                });
            }
            return res.status(403).json({
                message: "Đăng nhập thất bại",
                accessToken: null,
                expiredIn: null,
                userId: null,
                refreshToken: null,
            });
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    signup = async (req, res, next) => {
        try {
            let authService = new AuthService();
            let data = req.body;
            if(
                !data.phone || 
                !data.password || 
                !data.confirmPassword
            ) throw InputInfoEmpty;
            data.phone = data.phone?.trim()?.toLowerCase();

            if(data.password != data.confirmPassword) {
               throw ConfirmPasswordNotMatch;
            }

            let userByPhone = await authService.checkPhoneExist(data.phone);

            if(userByPhone) throw ExistedPhone;

            data.role = UserRole.Customer;

            let resp = await new AuthService().handleCustomerSignup(data);

            return res.status(200).json({
                message: "Thành công",
                ...resp,
            });
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    refresh = async (req, res, next) => {
        try {
            let token = req.body.refreshToken || null;
            let {action, accessToken, refreshToken, expiredIn, userId} = await new AuthLogin().handleRefresh(token);
            if(action) {
                return res.status(200).json({
                    message: new TranslateService(req).translateMessage(SuccessRespMessage, true),
                    accessToken,
                    expiredIn,
                    userId,
                    refreshToken,
                })
            }
            return res.status(403).json({message: "Hết phiên đăng nhập, Vui lòng đăng nhập lại"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    me = async (req, res, next) => {
        try {
            let userId = req.user.userId ? parseInt(req.user.userId) : null;
            if(!userId) throw UserNotFound;
            let user = await User.findOne({
                where: {
                    id: userId
                },
                include: [
                    {
                        model: Staff,
                        as: "staff"
                    }
                ]
            });
            if(!user) throw UserNotFound;
            
            return res.status(200).json(user);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    initForgetPassword = async (req, res, next) => {
        try {
            let authService = new AuthService();
            let email = req.body.email || null;
            if(!email) throw EmailEmpty;
            if(!Validation.checkValidEmailFormat(email)) throw EmailFormatNotValid;

            await authService.initForgotPassword(email);
            
            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    updateForgetPassword = async (req, res, next) => {
        try {
            let authService = new AuthService();
            let resetKey = req.body.resetKey  || null;
            let password = req.body.password  || null;
            let confirmPassword = req.body.confirmPassword  || null;
            
            if(!password || !confirmPassword) throw PasswordEmpty;
            if(password != confirmPassword) throw ConfirmPasswordNotMatch;

            await authService.updateForgetPassword(resetKey, password);
            
            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }


    test = async (req, res, next) => {
        try {
            let env = process.env.NODE_ENV;
            let data = {
                environment: env,
                config: config[env]
            }
            return res.status(200).json(data);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }
}

module.exports = new AuthController();