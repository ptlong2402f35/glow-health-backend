const { Op, where } = require("sequelize");
const { ErrorService } = require("../services/errorService");
const { StaffServiceHelper } = require("../services/staffService/staffServiceHelper");

const Service = require("../model").Service;
const StaffService = require("../model").StaffService;
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

    getServiceOptions = async (req, res, next) => {
        try {
            let service = await Service.findAll();
            return res.status(200).json(service);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    getServiceByAdmin = async (req, res, next) => {
        try {
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 10;
            let active = req.query.active?.trim() || null;
            let name = req.query.search || null;
            let search = {};
            if(active) {
                search = {
                    ...search,
                    active
                }
            }
            if(name) {
                search = {
                    ...search,
                    name: {
                        [Op.iLike]: `%${name}%`
                    }
                }
            }
            let staffServices = await Service.paginate(
                {
                    page,
                    paginate: perPage,
                    where: search,
                    order: [["id", "desc"]],
                    include: [
                        {
                            model: ServiceGroup,
                            as: "serviceGroup"
                        }
                    ]
                }
            )
            return res.status(200).json(staffServices);
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

    updateServiceStatus = async (req, res, next) => {
        try {
            let id = req.params.id ? parseInt(req.params.id) : null;
            if(!id) throw InputInfoEmpty;
            let data = req.body;
            let bData = {
                active: data.active
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