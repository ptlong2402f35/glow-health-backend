const { Op } = require("sequelize");
const User = require("../../model").User;
const Staff = require("../../model").Staff;
const Store = require("../../model").Store;
const StaffService = require("../../model").StaffService;
const Service = require("../../model").Service;
const StaffServicePrice = require("../../model").StaffServicePrice;

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
        }
    ) {
        let conds = [];
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
        ];

        return attributes;
    }

    async buildIncludes({ includeStaffServicesPrice, includeStore }) {
		return [
			{
				model: Staff,
				as: "staff",
			},
            {
				model: User,
				as: "customer",
                attributes: ["id", "userName", "phone"]
			},
			...(includeStaffServicesPrice
				? [
						{
							model: StaffServicePrice,
							as: "staffServicePrices",
							include: [
								{
									model: StaffService,
									as: "staffService",
                                    include: [
                                        {
                                            model: Service,
                                            as: "service"
                                        },
                                        {
                                            model: ServiceGroup,
                                            as: "serviceGroup"
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
				attributes:["id", "name", "storeStation"],
			}] : []),
		];
	}
}

module.exports = {
    OrderQuerier
}