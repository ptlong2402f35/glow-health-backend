const { Op } = require("sequelize");
const { TransactionNotFound } = require("../constants/message");
const { ErrorService } = require("../services/errorService");
const { TransactionService } = require("../services/transaction/transactionService");
const { sequelize } = require("../model");
const { CommunicationService } = require("../services/communication/communicationService");
const { NotificationType, NotificationActionType } = require("../constants/type");
const AdminUserId = process.env.ADMIN_USER_ID ? parseInt(process.env.ADMIN_USER_ID) : 1;
const Transaction = require("../model").Transaction;
const User = require("../model").User;
const util = require("util");

class TransactionController {
    adminGetTrans = async (req, res, next) => {
        try {
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 50;
            let phone = req.query.phone || null;
            let keyword = req.query.search || null;
            let fromDate = req.query.fromDate ? new Date(req.query.fromDate) : null;
            let toDate = req.query.toDate ? new Date(req.query.toDate) : null;
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

            if(keyword) {
                search = [
                    ...search,
                    {
                        code: {
                            [Op.iLike]: `%${keyword}%`
                        }
                    }
                ]
            }

            if(fromDate) {
                search = [
                    ...search,
                    {
                        createdAt: {
                            [Op.gte]: fromDate
                        }
                    }
                ]
            }

            if(toDate) {
                search = [
                    ...search,
                    {
                        createdAt: {
                            [Op.lte]: toDate
                        }
                    }
                ]
            }

            console.log("search ===", util.inspect(search, false, null, true))

            let data = await Transaction.paginate({
                page,
                paginate: perPage,
                where: {
                    [Op.and]: search
                },
                order: [["id", "desc"]],
                include: [
                    {
                        model: User,
                        as: "user",
                        attributes: ["id", "userName", "phone"]
                    }
                ]
            });

            try {
                const totalAmount = await Transaction.findAll({
                    attributes: [
                        [sequelize.fn('SUM', sequelize.fn('ABS', sequelize.col('money'))), 'totalMoney'],
                    ],
                    raw: true
                });
    
                data.totalMoney = totalAmount?.[0]?.totalMoney;
            }
            catch (err) {
                console.error(err);
            }

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
                    try {
                        await new CommunicationService().sendNotificationToUserId(
                            data.userId,
                            "Admin nạp tiền",
                            `Bạn được cộng ${data.amount}đ vào ví Glow`,
                            NotificationType.Transaction,
                            {
                                actionType: NotificationActionType.Wallet.type
                            }
                        );
                    }
                    catch (err) {
                        console.error(err);
                    }
                    try {
                        await new CommunicationService().sendMobileNotification(
                            data.userId,
                            "Admin nạp tiền",
                            `Bạn được cộng ${data.amount}đ vào ví Glow`,
                        );
                    }
                    catch (err) {
                        console.error(err);
                    }

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
                    try {
                        await new CommunicationService().sendNotificationToUserId(
                            data.userId,
                            "Admin trừ tiền",
                            `Bạn bị trừ ${data.amount}đ trong ví Glow`,
                            NotificationType.Transaction,
                            {
                                actionType: NotificationActionType.Wallet.type
                            }
                        );
                    }
                    catch (err) {
                        console.error(err);
                    }

                    try {
                        await new CommunicationService().sendMobileNotification(
                            data.userId,
                            "Admin trừ tiền",
                            `Bạn bị trừ ${data.amount}đ vào ví Glow`,
                        );
                    }
                    catch (err) {
                        console.error(err);
                    }

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