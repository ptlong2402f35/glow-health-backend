const { ErrorService } = require("../services/errorService");
const PaymentMethod = require("../resources/paymentMethod.json");

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