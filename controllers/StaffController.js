const { Op } = require("sequelize");
const staff = require("../model/staff");
const { StaffQuerier } = require("../services/staff/staffQuerier");
const { ErrorService } = require("../services/errorService");
const { UserNotFound, NotEnoughPermission, InputInfoEmpty } = require("../constants/message");
const { StaffCreateService } = require("../services/staff/staffCreateService");
const { StaffRegisterService } = require("../services/staff/staffRegisterService");
const { StaffUpdateService } = require("../services/staff/staffUpdateService");
const { OwnerService } = require("../services/staff/owner/ownerService");
const { StaffRole } = require("../constants/roles");
const { QuickForwardConfig } = require("../services/order/quickForward/quickForwardConfig");

const Transaction = require("../model").Transaction;
const User = require("../model").User;
const Staff = require("../model").Staff;
const Review = require("../model").Review;
const Order = require("../model").Order;
const StaffService = require("../model").StaffService;
const StaffServicePrice = require("../model").StaffServicePrice;

class StaffController {
    adminGetStaff = async (req, res, next) => {
        const staffQuerier = new StaffQuerier();
        try {
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 50;

            let whereQuerier = staffQuerier.buildQuerier(req.query);
            let searchConds = await staffQuerier.buildWhere(whereQuerier);
            let orderBy = staffQuerier.buildSort({
                sortId: true,
                sortDistance: whereQuerier.useCoordinate && whereQuerier.coordinateDistance
            });
            let attributes = staffQuerier.buildAttributes(whereQuerier);

            let data = await Staff.paginate({
                page,
                paginate: perPage,
                where: {
                    [Op.and]: searchConds
                },
                include: [
                    {
                        model: User,
                        as: "user"
                    }
                ],
                order: orderBy,
                attributes
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

    adminGetStaffDetail = async (req, res, next) => {
        try {
            let id = req.params.id ? parseInt(req.params.id) :null;
            if(!id) throw UserNotFound;

            let staff = await Staff.findOne({
                where: {
                    id,
                },
                include: [
                    {
                        model: User,
                        as: "user"
                    }
                ],
            });

            return res.status(200).json(staff);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminCreateStaff = async (req, res, next) => {
        try {
            let data = req.body;
            let staff = await new StaffCreateService().adminCreateStaff(data);
            console.log("staff", staff);
            return res.status(200).json(staff);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminUpdateStaff = async (req, res, next) => {
        let staffCreateService = new StaffCreateService();
        try {
            let data = req.body;
            let staffId = req.params.id ? parseInt(req.params.id) : null;
            if(!staffId) throw InputInfoEmpty;
            let builtData = new StaffCreateService().build(data);

            await Staff.update(
                builtData,
                {
                    where: {
                        id: staffId
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

    adminDeactiveStaff = async (req, res, next) => {
        try {
            let id = req.params.id ? parseInt(req.params.id) : null;
            let data = req.body;
            await Staff.update(
                {
                    active: data.active
                },
                {
                    where: {
                        id
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

    getStaff = async (req, res, next) => {
        const staffQuerier = new StaffQuerier();
        try {
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 50;
            let useCoordinate = req.query.useCoordinate ? req.query.useCoordinate : false;
            let coordinateLat = req.query.coordinateLat ? parseFloat(req.query.coordinateLat) : 0;
            let coordinateLong = req.query.coordinateLong ? parseFloat(req.query.coordinateLong) : 0;

            let whereQuerier = staffQuerier.buildQuerier(req.query);
            let searchConds = await staffQuerier.buildWhere(whereQuerier);
            let orderBy = staffQuerier.buildSort({
                sortId: true,
                sortDistance: whereQuerier.useCoordinate && whereQuerier.coordinateDistance
            });
            let attributes = staffQuerier.buildAttributes(whereQuerier);
            let include = staffQuerier.buildIncludes({
                // includeStaffServices: true
            });

            let data = await Staff.paginate({
                page,
                paginate: perPage,
                where: {
                    [Op.and]: searchConds
                },
                order: orderBy,
                attributes
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

    getStaffDetail = async (req, res, next) => {
        try {
            let id = req.params.id ? parseInt(req.params.id) :null;
            if(!id) throw UserNotFound;

            let include = new StaffQuerier().buildIncludes({includeStaffServices: true});

            let staff = await Staff.findOne({
                where: {
                    id,
                },
                include: include
            });

            return res.status(200).json(staff);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    staffRegister = async (req, res, next) => {
        const staffRegisterService = new StaffRegisterService(); 
        try {
            let data = req.body;
            let userId = req.user.userId;
            
            await staffRegisterService.registerStaffByCustomer(data, userId);

            return res.status(200).json({message: "DONE"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    updateMyStaffDetail = async (req, res, next) => {
        const staffUpdateService = new StaffUpdateService(); 
        try {
            let data = req.body;
            let userId = req.user.userId;
            
            await staffUpdateService.updateMyStaffDetail(data, userId);

            return res.status(200).json({message: "DONE"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    ownerGetStaffs = async (req, res, next) => {
        try {
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 10;
            let userId = req.user.userId;

            let storeStaff = await Staff.findOne(
                {
                    where: {
                        userId,
                        staffRole: StaffRole.OwnerStation
                    }
                }
            );

            if(!storeStaff) throw NotEnoughPermission;
            let data = await Staff.paginate(
                {
                    page,
                    paginate: perPage,
                    where: {
                        storeId: storeStaff.storeId,
                        staffRole: StaffRole.Individual,
                    },
                    order: [["id", "desc"]]
                }
            );

            data.currentPage = page;

            return res.status(200).json(data);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    ownerGetDetailStaff = async (req, res, next) => {
        const ownerService = new OwnerService(); 
        try {
            let id = req.params.id ? parseInt(req.params.id) : null;
            let userId = req.user.userId;
            
            let storeStaff = await ownerService.validatePermission(userId);
            
            let staff = await Staff.findOne(
                {
                    where: {
                        id,
                        staffRole: StaffRole.Individual,
                        storeId: storeStaff.storeId
                    }
                }
            )

            return res.status(200).json(staff);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    ownerCreateStaff = async (req, res, next) => {
        const ownerService = new OwnerService();
        const staffCreateService = new StaffCreateService();
        try {
            let data = req.body;
            let userId = req.user.userId;
            
            let storeStaff = await ownerService.validatePermission(userId);
            
            await staffCreateService.adminCreateStaff(
                {
                    ...data,
                    storeId: storeStaff.storeId,
                    staffRole: StaffRole.Individual,
                }
            );

            return res.status(200).json(staff);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    ownerUpdateStaffDetail = async (req, res, next) => {
        const ownerService = new OwnerService();
        try {
            let data = req.body;
            let userId = req.user.userId;
            
            let storeStaff = await ownerService.validatePermission(userId);
            
            await new StaffUpdateService().ownerUpdateStaffDetail(
                {
                    ...data,
                }
            );

            return res.status(200).json(staff);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    ownerRemoveStaff = async (req, res, next) => {
        const ownerService = new OwnerService();
        try {
            let id = req.params.id ? parseInt(req.params.id) : null;
            let userId = req.user.userId;
            
            let storeStaff = await ownerService.validatePermission(userId);

            await Staff.update(
                {
                    storeId: null,
                },
                {
                    where: {
                        id
                    }
                }
            )

            return res.status(200).json({message: "DONE"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    ownerGetStaffReady = async (req, res, next) => {
        const ownerService = new OwnerService();
        try {
            let userId = req.user.userId;
            
            let staffs = await ownerService.getStoreStaff(userId, 
                {
                    busy: false,
                    online: true,
                    active: true
                }
            )

            return res.status(200).json(staffs);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    getPinnedStaff = async (req, res, next) => {
        const quickForwardConfig = new QuickForwardConfig().getInstance();
        try {
            let id = req.params.id ? req.params.id?.trim() : null;
            if(!id) throw InputInfoEmpty;

            let config = await quickForwardConfig.getConfigById(id);

            let pinnedStaff = [...config.pinnedStaff];

            console.log("pinned staff ===", pinnedStaff);

            return res.status(200).json(pinnedStaff);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }
}

module.exports = new StaffController()
