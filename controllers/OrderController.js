const { Op } = require("sequelize");
const { InputInfoEmpty, UserNotFound, StaffNotFound } = require("../constants/message");
const { ErrorService } = require("../services/errorService");
const { OrderCancelService } = require("../services/order/orderCancelService");
const { OrderCreateService } = require("../services/order/orderCreate/orderCreateService");
const { OrderFinishService } = require("../services/order/orderFinishService");
const { OrderHelper } = require("../services/order/orderHelper");
const { OrderQuerier } = require("../services/order/orderQuerier");
const { OrderSwitch } = require("../services/order/switch/orderSwitch");
const { OrderForwarderStatus, OrderStatus } = require("../constants/status");
const { OrderReadyService } = require("../services/order/orderReadyService");
const { OrderRejectService } = require("../services/order/orderRejectService");
const { OrderReviewService } = require("../services/order/orderReviewService");
const staff = require("../model/staff");
const { PusherConfig } = require("../pusher/pusherConfig");
const { QuickForwardConfig } = require("../services/order/quickForward/quickForwardConfig");

const Order = require("../model").Order;
const Staff = require("../model").Staff;
const User = require("../model").User;
const OrderForwarder = require("../model").OrderForwarder;
const StaffService = require("../model").StaffService;
const StaffServicePrice = require("../model").StaffServicePrice;
const ServiceGroup = require("../model").ServiceGroup;
const Service = require("../model").Service;

class OrderController {
    adminGetOrder = async (req, res, next) => {
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
                include: includes,
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
            
            await new OrderFinishService().adminFinish(id);

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
            
            await new OrderCancelService().cancel(req.body, id);

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
            let includes = await orderQuerier.buildIncludes(
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
                include: includes,
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
            let includes = await orderQuerier.buildIncludes(
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
                    include: includes,
                    logging: true
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

    getMyOrderForwarder = async (req, res, next) => {
        const orderQuerier = new OrderQuerier();
        try {
            let orderId = req.params.orderId ? parseInt(req.params.orderId) : null;
            if(!orderId) throw InputInfoEmpty;
            let userId = req.user.userId;
            
            let orders = await OrderForwarder.findAll(
                {
                    where: {
                        orderId: orderId,
                        isAccept: true
                    },
                    include: [
                        {
                            model: Staff,
                            as: "staff",
                            attributes: ["id", "userId", "name", "images"],
                            include: [
                                {
                                    model: User,
                                    as: "user",
                                    attributes: ["id", "phone", "urlImage"]
                                }
                            ]
                        }
                    ]
                }
            );

            return res.status(200).json(orders);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    createOrder = async (req, res, next) => {
        try {
            const pusherConfig = new PusherConfig().getInstance();
            const quickForwardConfig = new QuickForwardConfig().getInstance();
            let data = req.body;
            let userId = req.user.userId;
            let pinnedStaffs = await quickForwardConfig.getPinnedStaff();
            let pinnedStaffIds = pinnedStaffs.map(item => item.id).filter(val => val);
            let isQuickForward = pinnedStaffIds.includes(data.staffId);
            
            let userCustomer = await User.findByPk(userId);
            let staff = await Staff.findByPk(data.staffId);
            if(!userCustomer) throw UserNotFound;
            if(!staff) throw StaffNotFound;

            let order = await new OrderCreateService().createDefaultOrder(data, staff, userCustomer, {isQuickForward});

            //pusher trigger
            try {
                pusherConfig.trigger({reload: true}, `pusher-channel-${staff.userId}`, "order-create-to-staff");
            }
            catch (err) {
                console.error(err);
            }

            return res.status(200).json(order);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    cancelMyOrder = async (req, res, next) => {
        try {
            let data = req.body;
            let userId = req.user.userId;
            let orderId = req.params.id ? parseInt(req.params.id) : null;
            if(!orderId) throw InputInfoEmpty;
            console.log("orderId", orderId);
            await new OrderCancelService().customerCancel(
                {
                    ...data, 
                    userId
                }, orderId);

            return res.status(200).json({message: "DONE"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    switchOrderToForwarder = async (req, res, next) => {
        try {
            let data = req.body;
            let userId = req.user.userId;

            let order = await new OrderSwitch().switchOrderToForwarder(data.baseOrderId, data.forwardOrderId);

            return res.status(200).json({message: "Done switch order to forwarder", orderId: order.id});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    getStaffOrders = async (req, res, next) => {
        const orderQuerier = new OrderQuerier();
        try {
            let limit = req.query.limit ? parseInt(req.query.limit) : 10;
            let orderOffset = req.query.orderOffset ? parseInt(req.query.orderOffset) : 0;
            let forwardOffset = req.query.forwardOffset ? parseInt(req.query.forwardOffset) : 0;
            let userId = req.user.userId;

            let staff = await Staff.findOne({where: {userId}});

            let conds = orderQuerier.buildWhere({
                staffId: staff.id,
            });

            conds = [
                ...conds,
                // {
                //     status: {
                //         [Op.notIn]: [OrderStatus.Canceled, OrderStatus.Denied]
                //     }
                // }
            ]

            let attributes = orderQuerier.buildAttributes();
            let includes = await orderQuerier.buildIncludes(
                {
                    includeStaffServicesPrice: true,
                    includeStore : true
                }
            );
            let sort = orderQuerier.buildSort({});

            let orders = await Order.findAll(
                {
                    where: {
                        [Op.and]: conds
                    },
                    limit: limit,
                    offset: orderOffset,
                    attributes,
                    include: includes,
                    order: sort
                }
            );

            let orderForwarders = await OrderForwarder.findAll(
                {
                    where: {
                        staffId: staff.id,
                        status: {
                            [Op.notIn]: [OrderForwarderStatus.Switched, OrderForwarderStatus.Reject]
                        }
                    },
                    limit: limit,
                    offset: forwardOffset,
                    include: [
                        {
                            model: Order,
                            as: "baseOrder",
                            include: [
                                {
                                    model: StaffServicePrice,
                                    as: "prices",
                                    attributes: ["id", "price", "unit"],
                                    include: [
                                        {
                                            model: StaffService,
                                            as: "staffService",
                                            attributes: ["id", "name"],
                                            include: [
                                                {
                                                    model: Service,
                                                    as: "service",
                                                    attributes: ["id", "name"],
                                                },
                                                {
                                                    model: ServiceGroup,
                                                    as: "serviceGroup",
                                                    attributes: ["id", "name"],
                                                }
                                            ]
                                        },
                                    ],
                                },
                            ]
                        },
                        {
                            model: Staff, 
                            as: "staff",
                            include: [
                                {
                                    model: User,
                                    as: "user",
                                    attributes: ["id", "email", "phone"]
                                }
                            ]
                        }
                    ],
                    order: [ ["status", "asc"], ["isAccept", "desc"], ["id", "desc"]],
                }
            );

            // console.log("forwarder", orderForwarders.map(item => ({
            //     id: item.id,
            //     staffId: item.staffId,
            //     status: item.status,
            //     isAccept: item.isAccept
            // })));
            let data = await new OrderHelper().orderStaffProcessDisplay(orders, orderForwarders, {orderOffset, forwardOffset, limit});

            return res.status(200).json(data);

        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    getStaffOrderDetail = async (req, res, next) => {
        const orderQuerier = new OrderQuerier();
        try {
            let id = req.params.id ? parseInt(req.params.id) : null;
            if(!id) throw InputInfoEmpty;
            let userId = req.user.userId;
            let staff = await Staff.findOne({where: {userId}});
            
            let order = await Order.findOne(
                {
                    where: {
                        id
                    },
                    include: [
                        {
                            model: StaffServicePrice,
                            as: "prices",
                            attributes: ["id", "price", "unit"],
                            include: [
                                {
                                    model: StaffService,
                                    as: "staffService",
                                    attributes: ["id", "name"],
                                    include: [
                                        {
                                            model: Service,
                                            as: "service",
                                            attributes: ["id", "name"],
                                        },
                                        {
                                            model: ServiceGroup,
                                            as: "serviceGroup",
                                            attributes: ["id", "name"],
                                        }
                                    ]
                                },
                            ],
                        },
                    ]
                }
            );

            if(order.staffId != staff.id) {
                //forwarder 
                let forwardOrder = await OrderForwarder.findOne({
                    where: {
                        orderId: order.id,
                        staffId: staff.id
                    }
                });

                if(forwardOrder) {
                    order = await new OrderHelper().convertForwardDataToOrder(order, forwardOrder, staff);
                }
            }

            return res.status(200).json(order);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    readyOrder = async (req, res, next) => {
        try {
            let id = req.params.id ? parseInt(req.params.id) : null;
            if(!id) throw InputInfoEmpty;
            let userId = req.user.userId;
            let staff = await Staff.findOne({where: {userId}});

            let {isApproved, isReady, isQuickForward} = await new OrderReadyService().ready(id, staff);

            if(isApproved) {
                return res.status(200).json({message: "Approve order successfully", isApproved});
            }

            if(isReady) {
                return res.status(200).json({message: "ready forward order successfully", isReady});
            }

            if(isQuickForward) {
                return res.status(200).json({message: "Approve quick order successfully", isQuickForward});
            }
            
            return res.status(200).json({message: "DONE"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    rejectOrder = async (req, res, next) => {
        try {
            let id = req.params.id ? parseInt(req.params.id) : null;
            if(!id) throw InputInfoEmpty;
            let data = req.body;
            let userId = req.user.userId;
            let staff = await Staff.findOne({where: {userId}});

            let isOwner = await new OrderRejectService().defaultReject(id, staff);

            if(isOwner) return res.status(200).json({message: "reject my order successfully"});
            
            return res.status(200).json({message: "DONE"})
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    cancelOrder = async (req, res, next) => {
        try {
            let id = req.params.id ? parseInt(req.params.id) : null;
            if(!id) throw InputInfoEmpty; 
            let data = req.body;
            let userId = req.user.userId;
            let staff = await Staff.findOne({where: {userId}});

            await new OrderCancelService().cancel(data, id);
            
            return res.status(200).json({message: "DONE"})
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    finishOrder = async (req, res, next) => {
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

    reviewMyOrder = async (req, res, next) => {
        try {
            let data = req.body;
            let userId = req.user.userId;

            await new OrderReviewService().review(
                {
                    ...data,
                    userId
                }, data.orderId);
            
            return res.status(200).json({message: "DONE"})
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    ownerGetStaffOrders = async (req, res, next) => {
        const orderQuerier = new OrderQuerier();
        try {
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 10;
            let orderOffset = req.query.orderOffset ? parseInt(req.query.orderOffset) : 0;
            let forwardOffset = req.query.forwardOffset ? parseInt(req.query.forwardOffset) : 0;
            let userId = req.user.userId;

            let staff = await Staff.findOne({where: {userId}});

            let conds = orderQuerier.buildWhere({
                storeId: staff.storeId 
            });

            let attributes = orderQuerier.buildAttributes();
            let includes = orderQuerier.buildIncludes(
                {
                    includeStaffServicesPrice: true,
                    includeStore : true
                }
            );
            let sort = orderQuerier.buildSort({});

            let orders = await Order.findAll(
                {
                    where: conds,
                    limit: perPage,
                    offset: orderOffset,
                    attributes,
                    include: includes,
                    order: sort
                }
            );

            let orderForwarders = await OrderForwarder.findAll(
                {
                    where: {
                        storeId: store.id,
                        staffId: 0,
                        status: {
                            [Op.notIn]: [OrderForwarderStatus.Switched, OrderForwarderStatus.Reject]
                        }
                    },
                    limit: perPage,
                    offset: forwardOffset,
                    include: [
                        {
                            model: Order,
                            as: "baseOrder",
                            include: [
                                {
                                    model: StaffServicePrice,
                                    as: "prices",
                                    include: [
                                        {
                                            model: StaffService,
                                            as: "staffService"
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            model: Staff, 
                            as: "staff",
                            include: [
                                {
                                    model: User,
                                    as: "user",
                                    attributes: ["id", "email", "phone"]
                                }
                            ]
                        }
                    ],
                    order: [ ["status", "asc"], ["id", "desc"]],
                }
            );

            let data = await new OrderHelper().orderStaffProcessDisplay(orders, orderForwarders, {orderOffset, forwardOffset, limit: perPage});

            return res.status(200).json(data);

        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    ownerGetStaffOrderDetail = async (req, res, next) => {
        const orderQuerier = new OrderQuerier();
        try {
            let id = req.params.id ? parseInt(req.params.id) : null;
            if(!id) throw InputInfoEmpty;
            let userId = req.user.userId;
            let staff = await Staff.findOne({where: {userId}});
            
            let order = await Order.findOne(
                {
                    where: {
                        id
                    },
                    include: [
                        {
                            model: Staff,
                            as: "staff",
                        },
                        {
                            model: User,
                            as: "customerUser",
                            attributes: ["id", "userName", "phone"]
                        },
                        {
							model: StaffServicePrice,
							as: "prices",
                            attributes: ["id", "price", "unit"],
							include: [
								{
									model: StaffService,
									as: "staffService",
                                    attributes: ["id", "name"],
                                    include: [
                                        {
                                            model: Service,
                                            as: "service",
                                            attributes: ["id", "name"],
                                        },
                                        {
                                            model: ServiceGroup,
                                            as: "serviceGroup",
                                            attributes: ["id", "name"],
                                        }
                                    ]
								},
							],
						},
                    ]
                }
            );

            if(order.staffId != staff.id) {
                //forwarder 
            }

            return res.status(200).json(order);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    ownerReadyOrder = async (req, res, next) => {
        try {
            let orderId = req.params.id ? parseInt(req.params.id) : null;
            if(!orderId) throw InputInfoEmpty;
            let staffIds = req.body.staffIds;
            if(!staffIds.length) throw InputInfoEmpty;
            let userId = req.user.userId;

            let staff = await Staff.findOne({
                where: {
                    userId
                }
            })

            await new OrderReadyService().ownerReady(orderId, staff, staffIds);

            return res.status(200).json({message: "DONE"})
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    ownerRejectOrderForwarder = async (req, res, next) => {
        try {
            let orderId = req.params.id ? parseInt(req.params.id) : null;
            if(!orderId) throw InputInfoEmpty;
            let userId = req.user.userId;

            let staff = await Staff.findOne({
                where: {
                    userId
                }
            });

            await new OrderRejectService().ownerReject(orderId, staff);

            return res.status(200).json({message: "DONE"})
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    ownerCancelOrder = async (req, res, next) => {
        try {
            let orderId = req.params.id ? parseInt(req.params.id) : null;
            if(!orderId) throw InputInfoEmpty;
            let userId = req.user.userId;

            let staff = await Staff.findOne({
                where: {
                    userId
                }
            });

            await new OrderCancelService().cancel(orderId, staff);

            return res.status(200).json({message: "DONE"})
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    ownerFinishOrder = async (req, res, next) => {
        try {
            let orderId = req.params.id ? parseInt(req.params.id) : null;
            if(!orderId) throw InputInfoEmpty;
            let userId = req.user.userId;

            let staff = await Staff.findOne({
                where: {
                    userId
                }
            });

            await new OrderFinishService().ownerFinish(orderId, staff);

            return res.status(200).json({message: "DONE"})
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

}

module.exports = new OrderController();