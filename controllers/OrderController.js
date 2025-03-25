const { InputInfoEmpty } = require("../constants/message");
const { ErrorService } = require("../services/errorService");
const { OrderCancelService } = require("../services/order/orderCancelService");
const { OrderFinishService } = require("../services/order/orderFinishService");
const { OrderQuerier } = require("../services/order/orderQuerier");

const Order = require("../model").Order;
const Staff = require("../model").Staff;
const User = require("../model").User;

class OrderController {
    adminGetOrder = async () => {
        const orderQuerier = new OrderQuerier();
        try {
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 1;
            let staffId = req.query.staffId ? req.query.staffId : null;
            let status = req.query.status ? parseInt(req.query.status) : null;
            let multipleStatus = req.query.multipleStatus ? req.query.multipleStatus.split(";").map(val => parseInt(val)).filter(val => val) : null;
            let customerUserId = req.query.customerUserId ? parseInt(req.query.customerUserId) : null;
            let storeId = req.query.storeId ? parseInt(req.query.customerUserId) : null;
            let type = req.query.type ? parseInt(req.query.type) : null;

            let conds = orderQuerier.buildWhere({
                staffId,
                status,
                multipleStatus,
                customerUserId,
                storeId,
                type,
            });

            let attributes = orderQuerier.buildAttributes();
            let includes = orderQuerier.buildIncludes(
                {
                    includeStaffServicesPrice: true,
                    includeStore : true
                }
            );
            let sort = orderQuerier.buildSort({});

            let data = await Order.paginate({
                page,
                paginate: perPage,
                where: conds,
                attributes,
                includes,
                order: sort
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

    adminGetOrderDetail = async (req, res, next) => {
        const orderQuerier = new OrderQuerier();
        try {
            let id = req.params.id ? parseInt(req.params.id) : null;
            if(!id) throw InputInfoEmpty;
            let includes = orderQuerier.buildIncludes(
                {
                    includeStore: true,
                    includeStaffServicesPrice: true
                }
            );
            
            let order = await Order.findByPk(
                id,
                {
                    include: includes
                }
            );

            return res.status(200).json(order);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminGetOrderReasonCancel = async (req, res, next) => {
        const orderQuerier = new OrderQuerier();
        try {
            let id = req.params.id ? parseInt(req.params.id) : null;
            if(!id) throw InputInfoEmpty;
            let includes = orderQuerier.buildIncludes(
                {
                    includeStore: true,
                    includeStaffServicesPrice: true
                }
            );
            
            let order = await Order.findByPk(
                id,
                {
                    include: includes
                }
            );

            return res.status(200).json(order);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminFinishOrder = async (req, res, next) => {
        try {
            let id = req.params.id ? parseInt(req.params.id) : null;
            if(!id) throw InputInfoEmpty;
            
            await new OrderFinishService().finish(id);

            return res.status(200).json({message: "DONE"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminCancelOrder = async (req, res, next) => {
        try {
            let id = req.params.id ? parseInt(req.params.id) : null;
            if(!id) throw InputInfoEmpty;
            
            await new OrderCancelService().cancel(id);

            return res.status(200).json({message: "DONE"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    getMyOrder = async (req, res, next) => {
        const orderQuerier = new OrderQuerier();
        try {
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 1;
            let userId = req.user.userId;

            let conds = orderQuerier.buildWhere({
                customerUserId: userId,
            });

            let attributes = orderQuerier.buildAttributes();
            let includes = orderQuerier.buildIncludes(
                {
                    includeStaffServicesPrice: true,
                    includeStore : true
                }
            );
            let sort = orderQuerier.buildSort({});

            let data = await Order.paginate({
                page,
                paginate: perPage,
                where: conds,
                attributes,
                includes,
                order: sort
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

    getMyOrderDetail = async (req, res, next) => {
        const orderQuerier = new OrderQuerier();
        try {
            let id = req.params.id ? parseInt(req.params.id) : null;
            if(!id) throw InputInfoEmpty;
            let userId = req.user.userId;
            let includes = orderQuerier.buildIncludes(
                {
                    includeStore: true,
                    includeStaffServicesPrice: true
                }
            );
            
            let order = await Order.findOne(
                {
                    where: {
                        customerUserId: userId,
                        id
                    },
                    include: includes
                }
            );

            return res.status(200).json(order);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    createOrder = async (req, res, next) => {
        try {

        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    
}

module.exports = {
    OrderController
}