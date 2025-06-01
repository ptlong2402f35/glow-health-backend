
const { Op } = require("sequelize");
const { ErrorService } = require("../services/errorService");
const { StaffServiceHelper } = require("../services/staffService/staffServiceHelper");
const { VoucherStatus } = require("../constants/status");
const { VoucherService } = require("../services/voucher/voucherService");

const Voucher = require("../model").Voucher;

class ReviewController {
    getReviews = async (req, res, next) => {
        try {
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 10;

            let conds = [];

            let data = await Review.paginate({
                page,
                paginate: perPage,
                where: conds,
                order: [["rate", "desc"],["id", "desc"]]
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

    getStaffReviews = async (req, res, next) => {
        try {
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 10;
            let staffId = req.params.staffId ? parseInt(req.params.staffId) : null;
            if(!staffId) return res.status(200).json([]);

            let data = await Review.paginate({
                page,
                paginate: perPage,
                where: {
                    staffId: staffId
                },
                order: [["rate", "desc"],["id", "desc"]]
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
}

module.exports = new ReviewController();