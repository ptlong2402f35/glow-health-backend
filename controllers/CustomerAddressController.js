const { UserNotFound, InputInfoEmpty } = require("../constants/message");
const { ErrorService } = require("../services/errorService");
const User = require("../model").User;
const CustomerAddress = require("../model").CustomerAddress;

class CustomerAddressControler {
    userGetAddress = async (req, res, next) => {
        try {
            let userId = req.user.userId;
            
            let resp = CustomerAddress.findAll({
                where: {
                    customerUserId: userId
                }
            });

            return res.status(200).json(resp);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    userCreateAddress = async (req, res, next) => {
        try {
            let userId = req.user.userId;
            let data = req.body;
            if(!data.phone || !data.customerName) throw InputInfoEmpty;
            let resp = await CustomerAddress.create({
                ...data,
                active: true,
                default: data.isSetDefault ? true : false,
            });

            return res.status(200).json({message: "DONE", resp});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    userUpdateAddress = async (req, res, next) => {
        try {
            let userId = req.user.userId;
            let data = req.body;
            
            let resp = await CustomerAddress.update({
                ...data,
                default: data.isSetDefault ? true : false,
            }, {
                where: {
                    customerUserId: userId,
                    id: data.id
                }
            });

            return res.status(200).json({message: "DONE"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    userRemoveAddress = async (req, res, next) => {
        try {
            let userId = req.user.userId;
            let data = req.body;
            if(!data.phone || !data.customerName) throw InputInfoEmpty;
            await CustomerAddress.delete({
                where: {
                    id: data.id,
                    customerUserId: userId
                }
            });

            return res.status(200).json({message: "DONE"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }
}

module.exports = new CustomerAddressControler();