const { Op } = require("sequelize");
const { FirebaseConfig } = require("../../firebase/firebaseConfig");
const { EmailService } = require("./emailService");
const { ExpoCommunicationConfig } = require("./expoCommunication");
const Notification = require("../../model").Notification;
const User = require("../../model").User;

class CommunicationService {
    emailService;
    expoCommunicationConfig;
    constructor() {
        this.emailService = new EmailService();
        this.expoCommunicationConfig = new ExpoCommunicationConfig().getInstance();
    }

    async sendNotificationToUserId(userId, title, content, type, {actionType} = {}, referenceId) {
        console.log("userId", userId);
        try {
            await Notification.create({
                toUserId: userId,
                type: type,
                title,
                content,
                ...(actionType ? {actionType: actionType} : {}),
                seen: false,
                seenAt: null,
                referenceId: referenceId,
            });
        }
        catch (err) {
            console.error(err);
        }
    }

    async sendBulkNotificationToUserId(userIds, title, content, type, {actionType} = {}, referenceId) {
        try {
            await Notification.bulkCreate(userIds.map(item => (
                {
                    toUserId: item,
                    type: type,
                    title,
                    content,
                    ...(actionType ? {actionType: actionType} : {}),
                    seen: false,
                    seenAt: null,
                    referenceId
                }
            )));
        }
        catch (err) {
            console.error(err);
        }
    }
    
    //expo noti
    async sendMobileNotification(userId, title = "", body = "") {
        try {
            let user = await User.findByPk(userId);
            if(!user || !user.expoToken) return;
            console.log("user token", user.expoToken);
            await this.expoCommunicationConfig.sendExpoNotification(
                {
                    token: user.expoToken,
                    title,
                    body
                }
            );
        }
        catch (err) {
            console.error(err);
        }
    }

    async sendBulkMobileNotification(userIds, title = "", body = "") {
        try {
            if(!userIds || !userIds.length) return;
            let users = await User.findAll({
                where: {
                    id: {
                        [Op.in]: userIds
                    }
                }
            });
            let deviceUserIds = users.map(item => item.expoToken).filter(val => val);
            if(!deviceUserIds || !deviceUserIds.length) return;
            await this.expoCommunicationConfig.bulkSendNotification(
                {
                    tokens: deviceUserIds,
                    title,
                    body
                }
            );
        }
        catch (err) {
            console.error(err);
        }
    }

    async sendForgetPasswordEmail(email, user) {
        try {

        }
        catch (err) {
            throw err;
        }
    }

}

module.exports = {
    CommunicationService
}