const { Op } = require("sequelize");
const { ErrorService } = require("../services/errorService");
const Notification = require("../model").Notification;

class NotificationController {
    
    getMyNoti = async (req, res, next) => {
        try {
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 50;
            let userId = req.user.userId;

            let search = {
                toUserId: userId
            }

            let data = await Notification.paginate({
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

    updateNotiRead = async (req, res, next) => {
        try {
            let userId = req.user.userId;
            let data = req.body;
            
            if(data.readAll) {
                await Notification.update(
                    {
                        seen: true,
                        seenAt: new Date()
                    },
                    {
                        where: {
                            toUserId: userId,
                            seenAt: false,
                            seenAt: {
                                [Op.eq]: null
                            }
                        }
                    }
                );

                return res.status(200).json({message: "DONE"});
            }

            await Notification.update(
                {
                    seen: true,
                    seenAt: new Date()
                },
                {
                    where: {
                        toUserId: userId,
                        id: {
                            [Op.in]: data.notiIds
                        },
                        seenAt: false,
                        seenAt: {
                            [Op.eq]: null
                        }
                    }
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

module.exports = new NotificationController();