const { PaymentItegrateMethod } = require("../../constants/constants");
const { PaymentMethodNotValid } = require("../../constants/message");
const { NotificationType, NotificationActionType } = require("../../constants/type");
const { sequelize } = require("../../model");
const { CommunicationService } = require("../communication/communicationService");
const { TransactionService } = require("../transaction/transactionService");
const { PaypalAuthenticationFailed, Currency } = require("./paymentConstants");
const { PaypalPaymentService } = require("./paypalPaymentService");
const ExchangeValue = 23000;

class PaymentService {
    paypalPaymentService;
    communicationService;
    transactionService;
    constructor() {
        this.paypalPaymentService = new PaypalPaymentService();
        this.communicationService = new CommunicationService();
        this.transactionService = new TransactionService();
    }

    async createPaymentRequest(data) {
        try {
            switch (data) {
                case PaymentItegrateMethod.Paypal: {
                    let token = await this.paypalPaymentService.getAccessToken();
                    if(!token) throw PaypalAuthenticationFailed;
                    let stdMoney = Math.ceil(data.amount / ExchangeValue * 100) / 100;
                    let {paypalTransactionId, frontendData} = await this.paypalPaymentService.initPaymentData(token, stdMoney, Currency.USD);

                    return {
                        data: {
                            ...frontendData
                        }
                    }
                }
                default: {
                    throw PaymentMethodNotValid;
                }
            }
        }
        catch (err) {
            throw err;
        }
    }

    async paymentSuccess(data) {
        try {
            let token = await this.paypalPaymentService.getAccessToken();
            let resp = await this.paypalPaymentService.capturePaymentInfo(token, data.paypalTransactionId);
            let user = await this.createTransaction(data, resp.vndAmount || 0);
            this.noti(data.userId, user.totalMoney);
        }
        catch (err) {
            throw err;
        }
    }

    async createTransaction(data, amount) {
        let transaction = await sequelize.transaction();
        try {
            let walletUser = await this.transactionService.getWalletUser(data.userId, transaction);
            await this.transactionService.topupWallet(walletUser, 
                {
                    ...data,
                    amount,
                    forUserId: data.userId,
                    content: `Nạp ${amount}đ vào ví glow thành công`,
                    userCreate: data.userId,
                    add: true
                }, transaction);

            await transaction?.commit();

            return walletUser;
        }
        catch (err) {
            await transaction?.rollback();
        }
    }

    async noti(userId, nAmount) {
        try {
            await this.communicationService.sendNotificationToUserId(
                userId,
                "Thông báo",
                `Nạp tiền vào ví glow thành công. Số dư: ${nAmount}`,
                NotificationType.Transaction,
                {
                    actionType: NotificationActionType.Wallet.type
                },
            );
        }
        catch (err) {
            console.error(err);
        }
    }
}

module.exports = {
    PaymentService
}