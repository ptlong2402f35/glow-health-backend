const { Op } = require("sequelize");
const { FirebaseConfig } = require("../../firebase/firebaseConfig");
const { EmailService } = require("./emailService");
const Notification = require("../../models").Notification;
let FireBaseProjectId = process.env.FIREBASE_PROJECT_ID || "english-center-1e883";
let FCMPushNotiUrl = `https://fcm.googleapis.com/v1/projects/${FireBaseProjectId}/messages:send`
const User = require("../../models").User;

class CommunicationService {
    emailService;
    firebaseConfig;
    constructor() {
        this.emailService = new EmailService();
        this.firebaseConfig = new FirebaseConfig().getInstance();
    }

    async sendNotificationToUserId(userId, title, content, type, {actionType} = {}) {
        try {
            await Notification.create({
                toUserId: userId,
                type: type,
                title,
                content,
                ...(actionType ? {actionType: actionType} : {}),
                seen: false,
                seenAt: null
            });
        }
        catch (err) {
            console.error(err);
        }
    }

    async sendBulkNotificationToUserId(userIds, title, content, type, {actionType} = {}) {
        try {
            await Notification.bulkCreate(userIds.map(item => (
                {
                    toUserId: item,
                    type: type,
                    title,
                    content,
                    ...(actionType ? {actionType: actionType} : {}),
                    seen: false,
                    seenAt: null
                }
            )));
        }
        catch (err) {
            console.error(err);
        }
    }
    
    //fire base noti
    async sendMobileNotification(userId, title = "", body = "") {
        try {
            let user = await User.findByPk(userId);
            if(!user || !user.messageToken) return;
            await this.firebaseConfig.createMessage(user.messageToken, {
                title,
                body
            });
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
            let deviceUserIds = users.map(item => item.messageToken).filter(val => val);
            if(!deviceUserIds || !deviceUserIds.length) return;
            await this.firebaseConfig.createMessage(deviceUserIds, {
                title,
                body
            });
        }
        catch (err) {
            console.error(err);
        }
    }

}

module.exports = {
    CommunicationService
}