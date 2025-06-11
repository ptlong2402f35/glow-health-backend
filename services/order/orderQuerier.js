const { Op } = require("sequelize");
const User = require("../../model").User;
const Staff = require("../../model").Staff;
const Store = require("../../model").Store;
const StaffService = require("../../model").StaffService;
const Service = require("../../model").Service;
const StaffServicePrice = require("../../model").StaffServicePrice;
const ServiceGroup = require("../../model").ServiceGroup;
const Voucher = require("../../model").Voucher;

class OrderQuerier {
    constructor() {}

    buildWhere(
        {
            staffId,
            status,
            multipleStatus,
            customerUserId,
            storeId,
            type,
            displayForCustomer,
            fromDate,
            toDate,
            code,
            phone
        }
    ) {
        let conds = [];
        if(displayForCustomer) {
            conds = [
                ...conds,
                {
                    displayForCustomer: true
                }
            ]
        }
        if(staffId) {
            conds = [
                ...conds,
                {
                    staffId: staffId
                }
            ]
        }
        if(status) {
            conds = [
                ...conds,
                {
                    status: status
                }
            ]
        }
        if(multipleStatus) {
            conds = [
                ...conds,
                {
                    status: {
                        [Op.in]: multipleStatus
                    }
                }
            ]
        }
        if(customerUserId) {
            conds = [
                ...conds,
                {
                    customerUserId: customerUserId
                }
            ]
        }
        if(storeId) {
            conds = [
                ...conds,
                {
                    storeId: storeId
                }
            ]
        }
        if(type) {
            conds = [
                ...conds,
                {
                    type: type
                }
            ]
        }
        if(fromDate) {
            conds = [
                ...conds,
                {
                    createdAt: {
                        [Op.gte]: fromDate
                    }
                }
            ]
        }
        if(toDate) {
            conds = [
                ...conds,
                {
                    createdAt: {
                        [Op.lte]: toDate
                    }
                }
            ]
        }
        if(code) {
            conds = [
                ...conds,
                {
                    code: {
                        [Op.iLike]: `%${code}%`
                    }
                }
            ]
        }
        // if(phone) {
        //     conds = [
        //         ...conds,
        //         {
        //             phone: {
        //                 [Op.iLike]: `%${phone}%`
        //             }
        //         }
        //     ]
        // }

        return conds;
    }

    buildSort({
            sortDistance,
            useCoordinate,
            sortId = true
        }) {
            let sort = [];
    
            if(sortId) {
                sort = [["id", "desc"], ...sort];
            }
    
            return sort;
        }

    buildAttributes() {
        let attributes = [
            "id",
            "staffId",
            "total",
            "totalPay",
            "address",
            "provinceId",
            "districtId",
            "communeId",
            "lat",
            "long",
            "status",
            "customerUserId",
            "paymentMethodId",
            "fee",
            "code",
            "note",
            "earningRate",
            "storeId",
            "reasonCancel",
            "totalReceive",
            "expiredAt",
            "autoFinishAt",
            "chatBoxId",
            "timerTime",
            "additionalFee",
            "type",
            "forwardFromOrderId",
            "createdAt",
            "updatedAt",
            "serviceBooking",
            "orderSubStatus",
        ];

        return attributes;
    }

    async buildIncludes({ includeStaffServicesPrice, includeStore }) {
		return [
			{
				model: Staff,
				as: "staff",
                include: [
                    {
                        model: User,
                        as: "user",
                        attributes: ["id", "userName", "phone", "urlImage"]
                    }
                ]
			},
            {
				model: User,
				as: "customerUser",
                attributes: ["id", "userName", "phone", "urlImage"]
			},
            {
                model: Voucher,
                as: "voucher",
            },
			...(includeStaffServicesPrice
				? [
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
				: []),
			...(includeStore ? [{
				model: Store,
				as: "store",
				attributes:["id", "name"],
			}] : []),
		];
	}
}

module.exports = {
    OrderQuerier
}