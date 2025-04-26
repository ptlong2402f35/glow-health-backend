const PaymentInitFailedException = "PaymentInitFailedException";
const PaymentCurrencyNotSupportException = "PaymentCurrencyNotSupportException";
const PaymentCheckFailedException = "PaymentCheckFailedException";
const PaymentCheckInvalidException = "PaymentCheckInvalidException";
const RefundFailedException = "RefundFailedException";
const PaypalAuthenticationFailed = "PaypalAuthenticationFailed";

const Currency = {
    VND: "VND",
    USD: "USD",
};

const OnepayPaymentMethod = {
    Applepay: 1,
    Googlepay: 2,
    Samsungpay: 3,
    InterCard: 4,
    ATMCard: 5,
    QRPayment: 6
}

const OnepayResponseCode = {
    Success: "0",
};

const PaypalResponseCode = {
    PaymentCreated: "CREATED",
    CaptureCompleted: "COMPLETED",
    RefundCompleted: "COMPLETED",
};

const OnepayMultiplier = 100;
const OnepayOrderSuffix = {
    Prefix: process.env.TEST_PREFIX || "WHALELO_",
    RefundPrefix: "RF_",
};

const StripeMultiplier = 100;

module.exports = {
    PaymentInitFailedException,
    PaymentCurrencyNotSupportException,
    PaymentCheckFailedException,
    PaymentCheckInvalidException,
    RefundFailedException,
    PaypalAuthenticationFailed,
    Currency,
    OnepayResponseCode,
    OnepayPaymentMethod,
    PaypalResponseCode,
    OnepayMultiplier,
    OnepayOrderSuffix,
    StripeMultiplier
};