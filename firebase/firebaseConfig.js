const {initializeApp, applicationDefault} = require('firebase-admin/app');
require("dotenv").config();
const firebase = require('firebase-admin');
const util = require("util");
const {getMessaging} = require("firebase-admin/messaging");
const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
const SCOPES = [MESSAGING_SCOPE];
const { default: axios } = require("axios");
const { google } = require('googleapis');
const httpProxyAgent = require('https-proxy-agent');
const env = process.env.NODE_ENV;
const FirebaseEndpoint = "https://fcm.googleapis.com/v1/projects/english-center-1e883/messages:send";
console.log(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
const serviceAccount = require("../english-center-1e883-firebase-adminsdk-xqrnt-7578eb8db3.json");

class FirebaseConfig {
    static instance;
    firebase;

    getInstance() {
        if(!FirebaseConfig.instance) {
            FirebaseConfig.instance = new FirebaseConfig();
        }
        return FirebaseConfig.instance;
    }

    async init() {
        // const httpAgent = new httpProxyAgent('http://127.0.0.1:3000/');
        let databaseUrl = "";
        switch (env) {
            case 'staging':
              databaseUrl = 'https://english-center-backend.vercel.app/';
            case 'production':
              databaseUrl = 'https://english-center-backend.vercel.app/';
            default:
              databaseUrl = 'https://english-center-backend.vercel.app/';
        }
        this.firebase = firebase.initializeApp({
            credential: firebase.credential.cert(serviceAccount),
            // databaseURL: databaseUrl,
            // projectId: "english-center-1e883"
        })
    }

    async getAccessToken() {
        try {
            return new Promise(function(resolve, reject) {
                const jwtClient = new google.auth.JWT(
                  serviceAccount.client_email,
                  null,
                  serviceAccount.private_key,
                  SCOPES,
                  null
                );
                jwtClient.authorize(function(err, tokens) {
                  if (err) {
                    reject(err);
                    return;
                  }
                  resolve(tokens.access_token);
                });
              });
        }
        catch (err) {
            console.error(err);
            return ""
        }
    }

    async createMessage(deviceRegistToken, {title, body} = {}) {
        try {
            // let token = await this.getAccessToken();
            const message = {
                // topic: "Englishcenter",
                notification: {
                    title: title  || 'test',
                    body: body || 'test body'
                },
                token: deviceRegistToken.toString()
            };
            console.log("message", message);
            // Send a message to the device corresponding to the provided
            // registration token.
            // let resp = await axios.post(
            //     FirebaseEndpoint,
            //     message,
            //     {
            //         headers: {
            //             // "Content-Type": "application/json",
            //             "Authorization": `Bearer ${token}`,
            //         }
            //     },
            // )

            let resp = await this.firebase.messaging().send(message)
            
            console.log('Successfully sent message:', resp);

            return resp;
        }
        catch (err) {
            console.log('Fail sent message:');
             console.log(`==== error detail: `, util.inspect(err, false, null, true));
        }
    }

    async createMultipleMessage(devices, {title, body} = {}) {
        try {
            if(!devices || !devices.length) return;
            const message = {
                notification: {
                    title: title  || 'test',
                    body: body || 'test body'
                },
                token: devices
            };
              
            await getMessaging().sendMulticast(message);
        }
        catch (err) {
            console.error(err);
        }
    }
}

module.exports = {
    FirebaseConfig
}