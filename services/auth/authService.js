const User = require("../../model").User;
const jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var uuid = require("uuid");
const { sequelize } = require("../../model");
const JWT_CONFIG = require("../../config/jwt");
const { CommunicationService } = require("../communication/communicationService");
const { UserRole } = require("../../constants/roles");
const { UserNotFound, UpdateFailMessage, ExpiredResetKey, UpdateDoneMessage, UserNotActive } = require("../../constants/message");
const { CommunicationType } = require("../../constants/type");
const DefaultPartnerPassword = process.env.DEFAULT_PARTNER_PASSWORD?.trim() || "";

class AuthService {
    constructor() {

    }

    async generateToken(user, forDev) {
        try {
            const accessToken = jwt.sign(
                {
                    user_id: user.id,
                    phone: user.phone,
                    role: user.role,
                    active: user.active
                },
                JWT_CONFIG.SECRET_KEY,
                {
                    expiresIn: forDev ? JWT_CONFIG.AccessTokenTimev2 : JWT_CONFIG.AccessTokenTime
                }
            );

            const refreshToken = jwt.sign(
                {
                    user_id: user.id,
                    role: user.role,
                },
                JWT_CONFIG.REFRESH_SECRET_KEY,
                {
                    expiresIn: JWT_CONFIG.RefreshTokenTime
                }
            );

            return {
                accessToken,
                refreshToken,
                expiredIn: JWT_CONFIG.AccessTokenTime * 1000 + new Date().getTime(),
            }
        }
        catch(err) {
            console.log(err);
            return {};
        }
    }

    async generateTokenByRefresh(token) {
        try {
            const decodeJwt = jwt.verify(token, JWT_CONFIG.REFRESH_SECRET_KEY);
            if(decodeJwt && decodeJwt.user_id) {
                let user = await User.findByPk(decodeJwt.user_id);
                if(!user) throw UserNotFound;
                if(!user.active) throw UserNotActive;
                const accessToken = jwt.sign(
                    {
                        user_id: user.id,
                        phone: user.phone,
                        role: user.role,
                        active: user.active
                    },
                    JWT_CONFIG.SECRET_KEY,
                    {
                        expiresIn: JWT_CONFIG.AccessTokenTime
                    }
                );

                return {
                    accessToken, 
                    refreshToken: token,
                    user,
                }
            }
            return  {
                accessToken: null,
                user: null,
                refreshToken: token,
            }
        }
        catch (err) {
            throw err;
        }
    }

    async initForgotPassword(email) {
        try {
            let user = await this.checkEmailExist(email);
            if(!user) throw UserNotFound;

            await new CommunicationService().sendForgetPasswordEmail(email, user);
        }
        catch (err) {
            throw err;
        }
    }

    async updateForgetPassword(resetKey, password) {
        try {
            let user = await User.findOne({
                where: {
                    resetKey: resetKey
                }
            });
            if(user?.resetKeyExpiredAt && user.resetKeyExpiredAt <= new Date()) throw ExpiredResetKey;
            if(!user) throw UserNotFound;
            let passHashed = bcrypt.hashSync(password, 10);
            let newResetKey = uuid.v4();
            await user.update({
                password: passHashed,
                resetKey: newResetKey,
                updatedAt: new Date()
            });
        }
        catch (err) {
            throw err;
        }
    }

    async handleCustomerSignup(data, transaction) {
        try {
			let passHashed = bcrypt.hashSync(data.password, 10);
            let user;
            user = await User.create(
                {
                    userName: data.userName,
                    phone: data.phone,
                    email: data.email,
                    password: passHashed,
                    role: data.role,
                    urlImage: data.urlImage,
                    active: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    resetKey: uuid.v4()
                },
                {
                    ...(transaction ? {transaction} : {}),
                }
            );
            if(!user) throw UpdateFailMessage;
            let resp = {
                userId: user.id,
                user: user
            };
            const {accessToken, refreshToken, expiredIn} = await this.generateToken(user);
            if(accessToken && refreshToken) {
                resp.accessToken = accessToken;
                resp.refreshToken = refreshToken;
                resp.expiredIn = expiredIn;
            }
            return resp;
        }
        catch (err) {
            throw err;
        }
    }

    async checkPhoneExist(phone) {
        try {
            if(!phone) return null;
    
            return await User.findOne({
                where: {
                    phone: phone
                }
            });
        }
        catch (err) {
            console.error(err);
            return null;
        }
    }

    async checkEmailExist(email) {
        try {
            if(!email) return null;
    
            return await User.findOne({
                where: {
                    email: email
                }
            });
        }
        catch (err) {
            console.error(err);
            return null;
        }
    }
}

module.exports = {
    AuthService,
}