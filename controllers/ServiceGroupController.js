
const { InputInfoEmpty, StaffNotFound } = require("../constants/message");
const { StoreStatus } = require("../constants/status");
const { ErrorService } = require("../services/errorService");
const { StaffCreateService } = require("../services/staff/staffCreateService");
const { StaffServiceHelper } = require("../services/staffService/staffServiceHelper");
const { StoreService } = require("../services/store/storeService");

const StaffService = require("../model").StaffService;
const ServiceGroup = require("../model").ServiceGroup;
const Service = require("../model").Service;
const Staff = require("../model").Staff;

class ServiceGroupController {
    getServiceGroup = async (req, res, next) => {
        try {
            let data = await ServiceGroup.findAll({
                where: {
                    active: true,
                },
                order: [["id", "desc"]],
            });

            return res.status(200).json(data);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    createServiceGroup = async (req, res, next) => {
        try {
            let data = req.body;
            let bData = {
                name: data.name,
                image: data.image,
                active: true
            }
            let resp = await ServiceGroup.create(
                {
                    ...bData
                }
            );

            return res.status(200).json(resp);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    updateServiceGroup = async (req, res, next) => {
        try {
            let id = req.params.id ? parseInt(req.params.id) : null;
            if(!id) throw InputInfoEmpty;
            let data = req.body;
            let bData = {
                name: data.name,
                image: data.image,
                active: data.active
            }
            let resp = await ServiceGroup.update(
                {
                    ...bData
                },
                {
                    where: {
                        id
                    }
                }
            );


            return res.status(200).json(resp);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    removeServiceGroup = async (req, res, next) => {
        try {
            let id = req.params.id ? parseInt(req.params.id) : null;
            if(!id) throw InputInfoEmpty;
            await ServiceGroup.destroy(
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

}

module.exports = new ServiceGroupController();