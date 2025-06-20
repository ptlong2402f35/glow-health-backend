const { Op } = require("sequelize");
const { PaymentItegrateMethod } = require("../../constants/constants");
const { PaymentMethodNotValid } = require("../../constants/message");
const { NotificationType, NotificationActionType } = require("../../constants/type");
const { sequelize } = require("../../model");
const { CommunicationService } = require("../communication/communicationService");
const { TransactionService } = require("../transaction/transactionService");
const { PaypalAuthenticationFailed, Currency } = require("./paymentConstants");
const { PaypalPaymentService } = require("./paypalPaymentService");
const { VnpayPaymentService, VnpayTransStatus } = require("./vnpayPaymentService");
const ExchangeValue = 23000;
const Transaction = require("../../model").Transaction;

const PaymentMethodId = {
    Vnpay: 1,
    Paypal: 2,
}

class PaymentService {
    paypalPaymentService;
    vnpayPaymentService;
    communicationService;
    transactionService;
    constructor() {
        this.paypalPaymentService = new PaypalPaymentService();
        this.communicationService = new CommunicationService();
        this.transactionService = new TransactionService();
        this.vnpayPaymentService = new VnpayPaymentService();
    }

    async createPaymentRequest(data, userId) {
        try {
            switch(data.paymentMethodId) {
                case PaymentMethodId.Vnpay: {
                    let transData = {
                        ...data,
                        content: "Test",
                    }
                    return {data: await this.vnpayPaymentService.createPaymentUrl(transData)};
                }
                case PaymentMethodId.Paypal: {
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
            switch(data.paymentMethodId) {
                case PaymentMethodId.Vnpay: {
                    let tData = data.data;
                    if(tData.vnp_TransactionStatus != VnpayTransStatus.Success) return ({success: false, code: tData.vnp_TxnRef});
                    let txnRef = tData.vnp_TxnRef;
                    let transData = {
                        code: txnRef,
                        userId: data.userId,
                        amount: Math.round(parseFloat(tData.vnp_Amount) /100)
                    }
                    let valid = await this.checkValidTrans(txnRef);
                    if(valid) return {success: true, code: tData.vnp_TxnRef}
                    let trans = await this.createVnpayTransaction({...transData}, transData.amount);

                    return {success: true, code: tData.vnp_TxnRef}
                }
                case PaymentMethodId.Paypal: {
                    
                    let token = await this.paypalPaymentService.getAccessToken();
                    let resp = await this.paypalPaymentService.capturePaymentInfo(token, data.paypalTransactionId);
                    let user = await this.createTransaction(data, resp.vndAmount || 0);
                    await this.noti(data.userId, user.totalMoney);
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

    async createVnpayTransaction(data, amount) {
        let transaction = await sequelize.transaction();
        try {
            let walletUser = await this.transactionService.getWalletUser(data.userId, transaction);
            let trans = await this.transactionService.topupWallet(walletUser, 
                {
                    ...data,
                    amount,
                    forUserId: data.userId,
                    content: `Giao dịch nạp tiền vào ví Glow Health`,
                    userCreate: data.userId,
                    add: true,
                    success: true
                }, transaction);

            await transaction?.commit();

            return trans;
        }
        catch (err) {
            await transaction?.rollback();
        }
    }

    async checkValidTrans(code) {
        try {
            return await Transaction.findOne({
                where: {
                    code: {
                        [Op.iLike]: `${code}`
                    }
                }
            });
        }
        catch (err) {
            return null;
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
        try {
            await this.communicationService.sendMobileNotification(
                userId,
                "Thông báo",
                `Nạp tiền vào ví glow thành công. Số dư: ${nAmount}`,
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