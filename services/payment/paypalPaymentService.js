const { Currency, PaypalAuthenticationFailed, PaymentInitFailedException, PaypalResponseCode, PaymentCheckFailedException, PaymentCheckInvalidException, RefundFailedException } = require("./paymentConstants");
const axios = require("axios");
const util = require("util");
require("dotenv").config();

const PaypalBaseEndpoint = "https://api-m.sandbox.paypal.com";
const PaypalClientId = process.env.PAYPAL_CLIENT_ID?.trim();
const PaypalClientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();
const AxiosTimeOutDuration = process.env.AXIOS_TIME_OUT_DURATION ? parseFloat(process.env.AXIOS_TIME_OUT_DURATION) : 15000; 

class PaypalPaymentService {
    constructor() {}

    async getAccessToken() {
        let auth = Buffer
			.from(PaypalClientId + ":" + PaypalClientSecret)
			.toString("base64");

        let resp;
        try {
            resp = await axios.post(
                `${PaypalBaseEndpoint}/v1/oauth2/token`,
                new URLSearchParams({
                    grant_type: "client_credentials",
                }),
                {
                    headers: { 
                        // "Content-Type": "application/x-www-form-urlencoded",
                        "Authorization": `Basic ${auth}`,
                    },
                    timeout: AxiosTimeOutDuration
                },
            );
        }
        catch(err) {
            console.error(err);
            throw PaypalAuthenticationFailed;
        }
        if(!resp?.data?.access_token) throw PaypalAuthenticationFailed;

		return resp.data.access_token;
    }

    async initPaymentData(accessToken, amount, currency, vndAmount) {
        let resp;
        try {
            resp = await axios.post(
                `${PaypalBaseEndpoint}/v2/checkout/orders`,
                {
                    intent: "CAPTURE",
                    purchase_units: [
                        {
                            amount: {
                                currency_code: currency,
                                value: amount,
                            },
                            customAmount: vndAmount
                        },
                    ],
                },
                {
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`,
                    },
                    timeout: AxiosTimeOutDuration
                },
            );
        }
        catch(err) {
            console.error(err);
            throw PaymentInitFailedException;
        }

        console.log(`==== [PaypalPaymentService][initPaymentData] check response: `, util.inspect(resp?.data, false, null, true));
        if(!resp?.data) throw PaymentInitFailedException;
        if(resp.data.status !== PaypalResponseCode.PaymentCreated) throw PaymentInitFailedException;

        return {
            frontendData: resp.data,
            paypalTransactionId: resp.data.id,
        };
    }

    async capturePaymentInfo(accessToken, paypalTransactionId) {
        let resp;
        try {
            resp = await axios.post(
                `${PaypalBaseEndpoint}/v2/checkout/orders/${paypalTransactionId}/capture`,
                {},
                {
                    headers: { 
                        "Content-Type": "application/json",
                        // "PayPal-Request-Id": "7b92603e-77ed-4896-8e78-5dea2050476a",
                        "Authorization": `Bearer ${accessToken}`,
                    }
                },
            );
        }
        catch(err) {
            console.error(err);
            throw PaymentCheckFailedException;
        }

        console.log(`==== [PaypalPaymentService][capturePaymentInfo] check response: `, util.inspect(resp?.data, false, null, true));
        if(!resp?.data) throw PaymentCheckFailedException;
        if(resp.data.status !== PaypalResponseCode.CaptureCompleted) throw PaymentCheckInvalidException;
        if(!resp.data.purchase_units?.length
            || !resp.data.purchase_units[0].payments.captures?.length
            || resp.data.purchase_units[0].payments.captures[0].status !== PaypalResponseCode.CaptureCompleted) throw PaymentCheckInvalidException;

        return {
            vndAmount: resp.data.purchase_units[0].payments.captures[0].custom_id
                && parseInt(resp.data.purchase_units[0].payments.captures[0].vndAmount),
            amount: resp.data.purchase_units[0].payments.captures[0].amount.value
                && parseFloat(resp.data.purchase_units[0].payments.captures[0].amount?.value),
            currency: resp.data.purchase_units[0].payments.captures[0].amount?.currency_code,
            fee: resp.data.purchase_units[0].payments.captures[0].seller_receivable_breakdown?.paypal_fee?.value
                && parseFloat(resp.data.purchase_units[0].payments.captures[0].seller_receivable_breakdown?.paypal_fee?.value),
            transactionId: resp.data.purchase_units[0].payments.captures[0].id
        };
    }

    async resolveHookData(raw) {
        return {
            amount: 0,
            currency: Currency.VND,
            fee: 0,
        };
    }

    async refundPayment(accessToken, paypalTransactionId) {
        let resp;
        try {
            resp = await axios.post(
                `${PaypalBaseEndpoint}/v2/payments/captures/${paypalTransactionId}/refund`,
                {},
                {
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`,
                    },
                    timeout: AxiosTimeOutDuration
                },
            );
        }
        catch(err) {
            console.error(err);
            throw RefundFailedException;
        }

        console.log(`==== [PaypalPaymentService][refundPayment] check response: `, util.inspect(resp?.data, false, null, true));
        if(!resp?.data) throw RefundFailedException;
        if(resp.data.status !== PaypalResponseCode.RefundCompleted) throw RefundFailedException;

        return {
            paypalTransactionId: resp.data.id,
        };
    }
}

module.exports = {
    PaypalPaymentService
};