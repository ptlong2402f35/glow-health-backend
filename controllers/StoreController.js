const { Op } = require("sequelize");
const { InputInfoEmpty } = require("../constants/message");
const { StoreStatus } = require("../constants/status");
const { ErrorService } = require("../services/errorService");
const { StaffCreateService } = require("../services/staff/staffCreateService");
const { StoreService } = require("../services/store/storeService");

const Store = require("../model").Store;
const User = require("../model").User;

class StoreController {
    adminGetStore = async (req, res, next) => {
        try {
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 50;

            let searchConds = [];

            let data = await Store.paginate({
                page,
                paginate: perPage,
                where: {
                    [Op.and]: searchConds
                },
                order: [["id", "desc"]],
                include: [
                    {
                        model: User,
                        as: "storeOwnerUser",
                        attributes: ["id", "userName", "phone"]
                    }
                ]
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

    adminGetStoreDetail = async (req, res, next) => {
        try {
            let id = req.params.id ? parseInt(req.params.id) :null;
            if(!id) throw "StoreNotFound";

            let store = await Store.findOne({
                where: {
                    id,
                }
            });

            return res.status(200).json(store);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminCreateStore = async (req, res, next) => {
        try {
            let data = req.body;

            let bData ={
                name: data.name,
                status: StoreStatus.Active,
                ownUserId: data.ownUserId,
                ownStaffId: data.ownStaffId,
            }

            let store = await Store.create(bData);

            return res.status(200).json(store);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminUpdateStore = async (req, res, next) => {
        try {
            let data = req.body;
            let storeId = req.params.id ? parseInt(req.params.id) : null;
            if(!storeId) throw InputInfoEmpty;

            let bData ={
                name: data.name,
                ownUserId: data.ownUserId,
                ownStaffId: data.ownStaffId,
            }

            await Store.update(
                bData,
                {
                    where: {
                        id: storeId
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

    adminRemoveStore = async (req, res, next) => {
        try {
            let storeId = req.params.id ? parseInt(req.params.id) : null;
            if(!storeId) throw InputInfoEmpty;
            await Store.update(
                {
                    status: StoreStatus.Disabled
                },
                {
                    where: {
                        id: storeId
                    }
                }
            );

            await new StoreService().removeStoreHandler(id);

            return res.status(200).json({message: "DONE"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminGetStoreOption = async (req, res, next) => {
        try {

            let store = await Store.paginate({
                page: 1,
                paginate: 20,
                order: [["id", "desc"]]
            });

            return res.status(200).json(store);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }
}

module.exports = new StoreController();