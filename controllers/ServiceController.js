const { ErrorService } = require("../services/errorService");
const { StaffServiceHelper } = require("../services/staffService/staffServiceHelper");

const Service = require("../model").Service;
const ServiceGroup = require("../model").ServiceGroup;

class ServiceController {
    getService = async (req, res, next) => {
        try {
            return res.status(200).json(await new StaffServiceHelper().getDefaultFormat());
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    getServiceDetail = async (req, res, next) => {
        try {
            let id = req.params.id ? parseInt(req.params.id) : null;
            let service = await Service.findByPk(id, {
                include: [
                    {
                        model: ServiceGroup,
                        as: "serviceGroup"
                    }
                ]
            });
            return res.status(200).json(service);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    createService = async (req, res, next) => {
        try {
            let data = req.body;
            let bData = {
                name: data.name,
                serviceGroupId: data.serviceGroupId,
                description: data.description
            }
            let resp = await Service.create(
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

    updateService = async (req, res, next) => {
        try {
            let id = req.params.id ? parseInt(req.params.id) : null;
            if(!id) throw InputInfoEmpty;
            let data = req.body;
            let bData = {
                name: data.name,
                serviceGroupId: data.serviceGroupId,
                description: data.description
            }
            let resp = await Service.update(
                {
                    ...bData
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

    removeService = async (req, res, next) => {
        try {
            let id = req.params.id ? parseInt(req.params.id) : null;
            if(!id) throw InputInfoEmpty;
            await Service.destroy(
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

module.exports = new ServiceController();