const Pusher = require("pusher");

class PusherConfig {
    static instance;
    pusher;
    constructor() {
        
    }

    getInstance() {
        if(!PusherConfig.instance) {
            PusherConfig.instance = new PusherConfig();
        }
        return PusherConfig.instance;
    }

    async init() {
        this.pusher = new Pusher({
            appId: "1986270",
            key: "d3c6fad28f3cf1931a88",
            secret: "8b5b76c10b05c33d239b",
            cluster: "ap1",
            useTLS: true
        });

        console.log("this.pusher", this.pusher);
    }

    async trigger(data = {}, channel = "", event = "") {
        if(!channel && !event) return;
        console.log("trigger pusher", this.pusher);
        this.pusher.trigger(channel, event, data);
        console.log(`trigger data ${data} to channel ${channel} for event ${event} successfully!!!`);
    }
}

module.exports = {
    PusherConfig
}