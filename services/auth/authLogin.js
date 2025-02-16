const User = require("../../models").User;
var bcrypt = require("bcryptjs");
const { AuthService } = require("./authService");
const JWT_CONFIG = require("../../config/jwt");
const { UserNotFound, PasswordNotMatch } = require("../../constants/message");

class AuthLogin {
    authService;
    constructor() {
        this.authService = new AuthService();
    }

    async handleLogin(data, forDev) {
        try {
            let user = await User.findOne({
                where: {
                    userName: data.userName,
                }
            });
            if(!user) throw UserNotFound;
            let checkPass = bcrypt.compareSync(data.password, user.password);
            if(!checkPass) {
                throw PasswordNotMatch;
            }
            const {accessToken, refreshToken} = await this.authService.generateToken(user, forDev);
            if(accessToken && refreshToken) {
                return {
                    action: true,
                    accessToken,
                    refreshToken,
                    expiredIn: JWT_CONFIG.AccessTokenTime * 1000 + new Date().getTime(),
                    userId: user.id
                };
            }
            return {
                action: false,
            }
        }
        catch(err) {
            throw err;
        }
    }

    async handleRefresh(refreshToken) {
        try {
            let {accessToken, user} = await this.authService.generateTokenByRefresh(refreshToken);
            if(accessToken) {
                return {
                    action: true,
                    accessToken,
                    refreshToken,
                    expiredIn: JWT_CONFIG.AccessTokenTime * 1000 + new Date().getTime(),
                    userId: user.id
                };
            }
            return {
                action: false,
            }
        }
        catch (err) {
            throw err;
        }
    }

}

module.exports =  {
    AuthLogin,
}