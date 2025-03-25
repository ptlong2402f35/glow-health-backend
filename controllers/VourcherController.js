
const { Op } = require("sequelize");
const { ErrorService } = require("../services/errorService");
const { StaffServiceHelper } = require("../services/staffService/staffServiceHelper");
const { VourcherStatus } = require("../constants/status");
const { VourcherService } = require("../services/vourcher/vourcherService");

const Vourcher = require("../model").Vourcher;

class VourcherController {
    getVourcher = async (req, res, next) => {
        try {
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 1;
            let search = req.query.search ? req.query.search : null;
            let status = req.query.status ? parseInt(req.query.status) : null;
            let scope = req.query.scope ? parseInt(req.query.scope) : null;

            let conds = [];
            if(search) {
                conds = [
                    ...conds,
                    {
                        code: {
                            [Op.iLike]: `%${search}%`
                        }
                    }
                ]
            }
            if(status) {
                conds = [
                    ...conds,
                    {
                        status
                    }
                ]
            }
            if(scope) {
                conds = [
                    ...conds,
                    {
                        scope
                    }
                ]
            }

            let data = await Vourcher.paginate({
                page,
                paginate: perPage,
                where: conds,
                order: [["id", "desc"]]
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

    createVourcher = async (req, res, next) => {
        try {
            let data = req.body;
            let bData = new VourcherService().build(
                {
                    ...data,
                    status: VourcherStatus.Active
                }
            );
            let resp = await Vourcher.create(
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

    updateVourcher = async (req, res, next) => {
        try {
            let id = req.params.id ? parseInt(req.params.id) : null;
            if(!id) throw InputInfoEmpty;
            let data = req.body;
            let bData = new VourcherService().build(
                {
                    ...data,
                }
            );
            let resp = await Vourcher.update(
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

    removeVourcher = async (req, res, next) => {
        try {
            let id = req.params.id ? parseInt(req.params.id) : null;
            if(!id) throw InputInfoEmpty;
            await Vourcher.destroy(
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

    updateVourcherStatus = async (req, res, next) => {
        try {
            let id = req.params.id ? parseInt(req.params.id) : null;
            if(!id) throw InputInfoEmpty;
            await Vourcher.update(
                {
                    status: req.body.status
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
}

module.exports = new VourcherController();