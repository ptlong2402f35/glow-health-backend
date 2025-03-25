
const { InputInfoEmpty, StaffNotFound } = require("../constants/message");
const { StoreStatus } = require("../constants/status");
const { ErrorService } = require("../services/errorService");
const { StaffCreateService } = require("../services/staff/staffCreateService");
const { StaffServiceHelper } = require("../services/staffService/staffServiceHelper");
const { StoreService } = require("../services/store/storeService");

const StaffService = require("../model").StaffService;
const StaffServicePrice = require("../model").StaffServicePrice;
const Service = require("../model").Service;
const Staff = require("../model").Staff;

class StaffServiceController {
    adminGetStaffService = async (req, res, next) => {
        try {
            let staffId = req.query.staffId ? parseInt(req.query.staffId) : null;
            if(!staffId) throw InputInfoEmpty;

            let data = await StaffService.findAll({
                where: {
                    active: true,
                    staffId: staffId
                },
                order: [["id", "desc"]],
                include: [
                    {
                        model: StaffServicePrice,
                        as: "prices"
                    }
                ]
            });

            return res.status(200).json(data);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminUpdateStaffService = async (req, res, next) => {
        const staffServiceHelper = new StaffServiceHelper();
        try {
            let id = req.params.id ? parseInt(req.params.id) : null;
            let staffId = req.body.staffId;
            if(!id) throw InputInfoEmpty;
            let data = req.body;
            if(!staffId) throw StaffNotFound;

            let staff = await Staff.findByPk(staffId);
            if(!staff) throw StaffNotFound;

            await StaffServicePrice.destroy(
                {
                    where: {
                        staffServiceId: id
                    }
                }
            );
            let sspData = data.prices.map(item => staffServiceHelper.buildStaffServicePriceData(item)).filter(val => val);
            await StaffServicePrice.bulkCreate(sspData);
            let ssData = staffServiceHelper.buildStaffServiceData(data);
            let staffService = await StaffService.update(
                {
                    ...ssData
                },
                {
                    where: {
                        id
                    }
                }
            );

            return res.status(200).json(staffService);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminCreateStaffService = async (req, res, next) => {
        const staffServiceHelper = new StaffServiceHelper();
        try {
            let staffId = req.body.staffId;
            if(!id) throw InputInfoEmpty;
            let data = req.body;
            if(!staffId) throw StaffNotFound;

            let staff = await Staff.findByPk(staffId);
            if(!staff) throw StaffNotFound;

            let sspData = data.prices.map(item => staffServiceHelper.buildStaffServicePriceData(item)).filter(val => val);
            await StaffServicePrice.bulkCreate(sspData);
            let ssData = staffServiceHelper.buildStaffServiceData(data);
            let staffService = await StaffService.create(
                {
                    ...ssData
                }
            );

            return res.status(200).json(staffService);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminRemoveStaffService = async (req, res, next) => {
        try {
            let id = req.params.id ? parseInt(req.params.id) : null;
            let staffId = req.body.staffId;
            if(!id) throw InputInfoEmpty;
            if(!staffId) throw StaffNotFound;

            let staff = await Staff.findByPk(staffId);
            if(!staff) throw StaffNotFound;

            await StaffServicePrice.destroy(
                {
                    where: {
                        staffServiceId: id
                    }
                }
            );
            await StaffService.destroy(
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

    getMyStaffService = async (req, res, next) => {
        try {
            let userId = req.user.userId;
            let staff = await Staff.findOne({where: {userId}});
            if(!staff) throw StaffNotFound;
            let staffServices = await StaffService.findAll(
                {
                    where: {
                        staffId: staff.id
                    },
                    include: [
                        {
                            model: StaffServicePrice,
                            as: "prices"
                        }
                    ]
                }
            );
            let data = await new StaffServiceHelper().getDefaultFormat(staffServices);

            return res.status(200).json({message: "DONE"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    updateMyStaffService = async (req, res, next) => {
        let staffServiceHelper = new StaffServiceHelper();
        try {
            let id = req.params.id ? parseInt(req.params.id) : null;
            if(!id) throw InputInfoEmpty;
            let userId = req.user.userId;
            let staff = await Staff.findOne({where: {userId}});
            if(!staff) throw StaffNotFound;
            await StaffServicePrice.destroy(
                {
                    where: {
                        staffServiceId: id
                    }
                }
            );
            let sspData = data.prices.map(item => staffServiceHelper.buildStaffServicePriceData(item)).filter(val => val);
            await StaffServicePrice.bulkCreate(sspData);
            let ssData = staffServiceHelper.buildStaffServiceData(data);
            let staffService = await StaffService.update(
                {
                    ...ssData
                },
                {
                    where: {
                        id
                    }
                }
            );

            return res.status(200).json(staffService);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    deleteMyStaffService = async (req, res, next) => {
        let staffServiceHelper = new StaffServiceHelper();
        try {
            let id = req.params.id ? parseInt(req.params.id) : null;
            if(!id) throw InputInfoEmpty;
            let userId = req.user.userId;
            let staff = await Staff.findOne({where: {userId}});
            if(!staff) throw StaffNotFound;
            await StaffServicePrice.destroy(
                {
                    where: {
                        staffServiceId: id
                    }
                }
            );
            let staffService = await StaffService.destroy(
                {
                    where: {
                        id
                    }
                }
            );

            return res.status(200).json(staffService);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }
}

module.exports = new StaffServiceController();