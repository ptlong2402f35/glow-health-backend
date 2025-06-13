const { Expo } = require('expo-server-sdk');

class ExpoCommunicationConfig {
    static instance;
    client;
    constructor() {}

    getInstance() {
        if(!ExpoCommunicationConfig.instance) {
            ExpoCommunicationConfig.instance = new ExpoCommunicationConfig();
        }
        return ExpoCommunicationConfig.instance;
    }

    init() {
        this.client = new Expo();
    }

    async sendExpoNotification(data) {
        if(!data || !data.token) return;
        if(!this.checkIsExpoToken(data.token)) {
            console.error("expo Token is not valid");
            return;
        }

        let message = this.build(data.token, data);
        console.log("message ====", message);

        const chunks = this.client.chunkPushNotifications([message]);
        const tickets = [];
        console.log("chunks ====", chunks);
        for (let chunk of chunks) {
            try {
                const ticketChunk = await this.client.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
            } catch (error) {
                console.error(error);
            }
        }
    }

    async bulkSendNotification(data) {
        if(!data || !data.tokens.length) return;
        let excludeIds = [];
        for(let token of data.tokens) {
            if(!this.checkIsExpoToken(token)) excludeIds.push(token);
        }
        let acceptedTokens = data.tokens.filter(item => !excludeIds.includes(item));

        let message = acceptedTokens.map(item => this.build(item, data));

        const chunks = this.client.chunkPushNotifications(message);
        const tickets = [];

        for (let chunk of chunks) {
            try {
                const ticketChunk = await this.client.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
            } catch (error) {
                console.error(error);
            }
        }    
    }

    checkIsExpoToken(token) {
        return Expo.isExpoPushToken(token);
    }

    build(token, data) {
        return {
            to: token,
            sound: "default",
            title: data.title,
            body: data.body,
            data: {
                custom: data.custom
            },
            priority: "high",
            // channelId: "default",
            android: {
                channelId: "default",
                icon: "ic_notification",
                color: "#000000",
                priority: "high", 
                visibility: "public", 
            },
        }
    }
}

module.exports = {
    ExpoCommunicationConfig
}