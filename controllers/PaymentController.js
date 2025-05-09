const { ErrorService } = require("../services/errorService");
const PaymentMethod = require("../resources/paymentMethod.json");
const { PaymentService } = require("../services/payment/paymentService");

class PaymentController {
    getPaymentMethod = async (req, res, next) => {
        try {
            

            return res.status(200).json(PaymentMethod);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    userRecharge = async (req, res, next) => {
        try {
            let userId = req.user.userId;

            let amount = req.body.amount;
            let paymentMethodId = req.body.paymentMethodId;

            let resp = await new PaymentService().createPaymentRequest({
                amount,
                paymentMethodId
            }, userId);

            return res.status(200).json(resp);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    userRechargeSuccess = async (req, res, next) => {
        try {
            let userId = req.user.userId;
            let data = req.body;
            let resp = await new PaymentService().paymentSuccess(
                {
                    paypalTransactionId: data.paypalTransactionId,
                    userId,
                }
            );
            
            return res.status(200).json({message: "DONE"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }
}

module.exports = new PaymentController();