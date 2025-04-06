const { Op } = require("sequelize");
const { TransactionNotFound } = require("../constants/message");
const { ErrorService } = require("../services/errorService");
const { TransactionService } = require("../services/transaction/transactionService");
const { sequelize } = require("../model");
const AdminUserId = process.env.ADMIN_USER_ID ? parseInt(process.env.ADMIN_USER_ID) : 1;
const Transaction = require("../model").Transaction;
const User = require("../model").User;

class TransactionController {
    adminGetTrans = async (req, res, next) => {
        try {
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 50;
            let phone = req.query.phone || null;
            let search = [];

            if(phone) {
                let users = await User.findAll({
                    where: {
                        phone: {
                            [Op.iLike]: `%${phone}%`
                        }
                    }
                });

                let userIds = users.map(item => item.id).filter(val => val);
                search = [...search, {forUserId: { [Op.in]: userIds }}];
            }

            let data = await Transaction.paginate({
                page,
                paginate: perPage,
                where: {
                    [Op.and]: search
                },
                order: [["id", "desc"]],
            });

            data.currentPage = page;

            return res.status(200).json(data);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminCreateTrans = async (req, res, next) => {
        let transactionService = new TransactionService();
        try {
            let data = req.body;

            let t = await sequelize.transaction();
            let walletUser = await transactionService.getWalletUser(data.userId, t);
            let tran;
            switch(data.type) {
                case "add": {
                    tran = await transactionService.topupWallet(
                        walletUser,
                        {
                            ...data,
                            userCreate: AdminUserId,
                            forUserId: data.userId,
                            add: true
                        },
                        t
                    );

                    //noti

                    break;
                }
                case "sub": {
                    tran = await transactionService.chargeWallet(
                        walletUser,
                        {
                            ...data,
                            userCreate: AdminUserId,
                            forUserId: data.userId,
                            add: false
                        },
                        t
                    );

                    break;
                }

                default: {
                    break;
                }
                
            }
            

            return res.status(200).json({message: "Done"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    getMyTrans = async (req, res, next) => {
        try {
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 50;
            let userId = req.user.userId;

            let search = {
                forUserId: userId
            }

            let data = await Transaction.paginate({
                page,
                paginate: perPage,
                where: search,
                order: [["id", "desc"]],
            });

            data.currentPage = page;

            return res.status(200).json(data);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    getMyDetailTrans = async (req, res, next) => {
        try {
            let transId = req.params.transId ? parseInt(req.params.transId) : null;
            if(!transId) throw TransactionNotFound; 
            let userId = req.user.userId;

            let data = await Transaction.findOne({
                where: {
                    forUserId: userId,
                    id: transId
                }
            });

            return res.status(200).json(data);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }
}

module.exports = new TransactionController();