const VnpayTmnCode = process.env.VNPAY_TMN_CODE ? process.env.VNPAY_TMN_CODE?.trim() : null;
const VnpaySecretKey = process.env.VNPAY_SECRETKEY ? process.env.VNPAY_SECRETKEY?.trim() : null;
const VnpayPaymentUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const crypto = require("crypto");
const moment = require("moment");
const querystring = require('qs');
const VnPayCaptureSignedFail = "VnPayCaptureSignedFail";
const CryptoJS = require("crypto-js");

const VnpayTransStatus = {
    Success: "00",
    Pending: "01",
    Failed: "02",
}

class VnpayPaymentService {
    constructor() {}

    async createPaymentUrl(data, userId) {
        if(!data || !userId) return null;
        const createDate = moment().format('YYYYMMDDHHmmss');
        const orderId = moment().format('HHmmss');
        const expireDate = moment().add(1, 'day').format('YYYYMMDDHHmmss');

        let params = [
            {k: "vnp_Version", v: "2.1.0"},
            {k: "vnp_Command", v: "pay"},
            {k: "vnp_TmnCode", v: VnpayTmnCode},
            {k: "vnp_Amount", v: data.amount * 100},
            {k: "vnp_CreateDate", v: createDate},
            {k: "vnp_CurrCode", v: "VND"},
            {k: "vnp_IpAddr", v: "127.0.0.1"},
            {k: "vnp_Locale", v: "vn"},
            {k: "vnp_OrderInfo", v: data.content || "Giao dich chuyen tien"},
            {k: "vnp_OrderType", v: "other"},
            {k: "vnp_ReturnUrl", v: "https://www.google.com"},
            {k: "vnp_ExpireDate", v: expireDate},
            {k: "vnp_TxnRef", v: `${this.generateCode()}-${userId}`},
        ];

        let sortParams = params.sort((a, b) => a.k.localeCompare(b.k));

        let raw = sortParams
            .map((item) => `${item.k}=${encodeURIComponent(item.v)}`)
            .join("&");

        let hash = CryptoJS.HmacSHA512(raw, VnpaySecretKey).toString(CryptoJS.enc.Hex);

        let requestParam = {};
        [...sortParams, {k: "vnp_SecureHash", v: hash}]
            .forEach(item => requestParam[item.k] = item.v);

        let link = VnpayPaymentUrl + "?" + new URLSearchParams(requestParam).toString();

        console.log("url ===", link);

        return link;
    }

    async checkSignedPayment(query) {
        var vnp_Params = query;
    
        var secureHash = vnp_Params['vnp_SecureHash'];
    
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];
    
        vnp_Params = sortObject(vnp_Params);
    
        var config = require('config');
        var tmnCode = config.get('vnp_TmnCode');
        var secretKey = config.get('vnp_HashSecret');
    
        var signData = querystring.stringify(vnp_Params, { encode: false });
        var hmac = crypto.createHmac("sha512", secretKey);
        var signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");     
    
        if(secureHash === signed){    
            return {code: vnp_Params['vnp_ResponseCode']};
        } else{
            throw VnPayCaptureSignedFail;
        }
    }

    generateCode() {
        const string = crypto.randomBytes(8).toString("hex");
        return string.toUpperCase();
    }
}

module.exports = {
    VnpayPaymentService,
    VnpayTransStatus
}