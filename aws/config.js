require("dotenv").config();

module.exports = {
	BUCKET: process.env.AWS_BUCKET,
	REGION: process.env.AWS_REGION,
	AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
	AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,
};
