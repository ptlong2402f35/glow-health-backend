require("dotenv").config();

const JwtDuration = process.env.JWT_DURATION ? parseInt(process.env.JWT_DURATION) : (2 * 60);
const JwtDurationv2 = process.env.JWT_DURATION_V2 ? parseInt(process.env.JWT_DURATION_V2) : (2 * 60);
const RefreshTokenDuration = process.env.REFRESH_TOKEN_DURATION ? parseInt(process.env.REFRESH_TOKEN_DURATION) : (6 * 30 * 24 * 60 * 60);
const PasswordUpdateDuration = process.env.JWT_PASSWORD_UPDATE_DURATION ? parseInt(process.env.JWT_PASSWORD_UPDATE_DURATION) : (5 * 60);

const JWT_CONFIG = {
	SECRET_KEY: process.env.JWT_SECRET_KEY,
	REFRESH_SECRET_KEY: process.env.JWT_REFRESH_SECRET_KEY,
	AccessTokenTime: JwtDuration, //Thời gian của access token tính bằng giây
	AccessTokenTimev2: JwtDurationv2, //Thời gian của access token tính bằng giây
	RefreshTokenTime: RefreshTokenDuration, //Thời gian sống của refresh token trong 72 giờ,
	PasswordUpdateDuration: PasswordUpdateDuration
};

module.exports = JWT_CONFIG;
