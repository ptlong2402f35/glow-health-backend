const { Op } = require("sequelize");
const { sequelize } = require("../../model");
const { OrderForwarderStatus } = require("../../constants/status");
const { OrderForwarderType } = require("../../constants/type");

const Staff = require("../../model").Staff;
const OrderForwarder = require("../../model").OrderForwarder;
const Order = require("../../model").Order;
const User = require("../../model").User;
const Store = require("../../model").Store;
const StaffServicePrice = require("../../model").StaffServicePrice;
const StaffService = require("../../model").StaffService;
const EnableForwardStaff = process.env.ENABLE_FORWARD_STAFF === "true" ? true : false;
const ForwardStaffDistanceApply = process.env.FORWARD_STAFF_DISTANCE_APPLY ? parseInt(process.env.FORWARD_STAFF_DISTANCE_APPLY) : 10000;
const ForwardStaffDuration = process.env.FORWARD_STAFF_DURATION ? parseInt(process.env.FORWARD_STAFF_DURATION) : 40 * 60 * 1000;

class OrderForwarderService {
    constructor() {}

    async startOrderForwardingFromId(orderId) {
        let order = await Order.findOne({
			where: {
				id: orderId,
			},
			include: [
				{
					model: Staff,
					as: "staff",
				},
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
			],
		});

		return await this.startOrderForwarding(order);
    }

    async startOrderForwarding(order) {
        if (!EnableForwardStaff) return [];
		if (!order) return [];

		let { customerUser } = await this.prepare(order);
		let recommendStaffs = await this.buildListOrderForwardStaffs(
			order,
		);
		console.log(
			`==== [OrderForwardStarter] recommendStaffs: `,
			recommendStaffs?.map(item => ({
				id: item.id,
				userId: item.userId,
				gender: item.gender,
				serviceIds: item.serviceIds,
				serviceGroupIds: item.serviceGroupIds,
				distance: item.dataValues?.distance,
			})),
		);

		let cur = new Date();
		let stores = await this.prepareStore(recommendStaffs);
		
		let records = await this.createOrderForwarding(order, recommendStaffs, stores);
		
		console.log(`==== [OrderForwardStarter] done create order forwarders`);

		if (recommendStaffs?.length) {
			await this.notiOrderForwardStaffs(order, records, stores, customerUser);
			console.log(`==== [OrderForwardStarter] done notify forwarders`);
		}

		return records;
    }

    async prepare(order) {
        let customerUser = await User.findByPk(order.customerUserId);

		return {
			customerUser: customerUser,
		};
    }

    async buildListOrderForwardStaffs(order) {
        let serviceIds = order.prices.map(item => item.staffServiceId);
        let serviceGroups = order.prices.map(item => item.staffService.serviceGroupId);
        let baseUserId = order.customerUserId;
        
        //OR where
        let addressWhere = [
            sequelize.where(
                sequelize.fn(
                    "ST_DWithin",
                    sequelize.literal(`"coordinatet"::geography`),
                    sequelize.fn("ST_MakePoint", order.long || 0, order.lat || 0),
					ForwardStaffDistanceApply,
                ),
                true
            ),
            ...(order.provinceId ? [{ provinceId: order.provinceId }] : []),
            ...(order.districtId ? [{ districtId: order.districtId }] : []),
            ...(order.communeId ? [{ communeId: order.communeId }] : []),
        ];

        //AND where
        let where = [
            {
                [Op.or]: [
                    {
                        serviceIds: {
                            [Op.in]: serviceIds
                        }
                    },
                    {
                        serviceGroupIds: {
                            [Op.in]: serviceGroups
                        }
                    }
                ]
            },
            {
                [Op.or]: addressWhere
            },
            {
                userId: {
                    [Op.ne]: baseUserId
                }
            },
            {
                active: true
            },
            {
                busy: {
                    [Op.not]: true
                }
            }
        ];

        let staffs = await Staff.findAll(
            {
                where: {
                    [Op.and]: where,
                    limit: 20,
                    order: [
				        ...([sequelize.literal("distance asc")]),
                    ],
                    attributes: [
                        "id",
                        "userId",
                        "gender",
                        "storeId",
                        "serviceIds",
                        "serviceGroups",
                        [
                            sequelize.fn(
                                "ST_DistanceSphere",
                                sequelize.col("coordinate"),
                                sequelize.fn("ST_MakePoint", order.long || 0, order.lat || 0),
                            ),
                            "distance",
                        ],
                    ]
                }
            }
        );

        return staffs;
    }

    prepareStore(staffs) {
        let storeIds = staffs.map(item => item.storeId);
        return Store.findAll({
            where: {
                id: {
                    [Op.in]: storeIds
                }
            }
        });
    }

    async createOrderForwarding(order, recommendStaffs, stores) {
        if (!order) return [];

		let cur = new Date();
		let expiredAt = new Date(cur.getTime() + ForwardStaffDuration);
		let forwarders = (recommendStaffs || []).map(item => ({
			status: OrderForwarderStatus.Begin,
			isAccepted: false,
			orderId: order.id,
			staffId: item.id,
			expiredAt: expiredAt,
			createdAt: cur,
			updatedAt: cur,
			storeId: item.storeId || 0,
			type: OrderForwarderType.Normal,
			timerTime: order.timerTime,
		}));
		for (let store of stores || []) {
			if(store.id !== order.storeId) {
				forwarders.push({
					status: OrderForwarderStatus.Begin,
                    isAccepted: false,
                    orderId: order.id,
                    staffId: 0,
                    expiredAt: expiredAt,
                    createdAt: cur,
                    updatedAt: cur,
                    storeId: store.id || 0,
                    type: OrderForwarderType.Normal,
                    timerTime: order.timerTime,
				});
			}
		}

        let records = await OrderForwarder.bulkCreate(forwarders, { ignoreDuplicates: true });
		
		return records;
    }

    async notiStaff() {
        //noti 
        
    }
}

module.exports = {
    OrderForwarderService
}