const { Op } = require("sequelize");
const { sequelize } = require("../../model");
const { OrderForwarderStatus } = require("../../constants/status");
const { OrderForwarderType, NotificationType, NotificationActionType } = require("../../constants/type");
const util = require("util");
const { CommunicationService } = require("../communication/communicationService");

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
    communicationService;
    constructor() {
        this.communicationService = new CommunicationService();
    }

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
        // console.log("order", util.inspect(order, false, null, true));
		return await this.startOrderForwarding(order);
    }

    async startOrderForwarding(order) {
        if (!EnableForwardStaff) return [];
        console.log("start forwarding order", order.dataValues);
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
			this.notiOrderForwardStaffs(recommendStaffs, order);
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
        let distanceConds = order.lat && order.long;
        let baseStaffId = order.staffId;
        
        //OR where
        let addressWhere = [
            ...(distanceConds ? [sequelize.where(
                sequelize.fn(
                    "ST_DWithin",
                    sequelize.literal(`"coordinate"::geography`),
                    sequelize.fn("ST_MakePoint", order.long || 0, order.lat || 0),
					ForwardStaffDistanceApply,
                ),
                true
            )] : []),
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
                            [Op.overlap]: serviceIds
                        }
                    },
                    {
                        serviceGroupIds: {
                            [Op.overlap]: serviceGroups
                        }
                    },
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
                id: {
                    [Op.ne]: baseStaffId
                }
            },
            {
                active: true
            },
            {
                busy: {
                    [Op.not]: true
                }
            },
            ...(order.storeId ? [{
                storeId: {
                    [Op.ne]: order.storeId
                }
            }] : []),
        ];

        console.log("where", util.inspect(where, false, null, true));

        let staffs = await Staff.findAll(
            {
                where: {
                    [Op.and]: where,
                },
                limit: 20,
                order: [
                    ...(
                        distanceConds ? [
                            [sequelize.literal("distance asc")]
                        ] : []
                    ),
                    ["rateAvg", "desc"]
                ],
                attributes: [
                    "id",
                    "userId",
                    "gender",
                    "storeId",
                    "serviceIds",
                    "serviceGroupIds",
                    ...(distanceConds ?
                        [
                        [sequelize.fn(
                            "ST_DistanceSphere",
                            sequelize.col("coordinate"),
                            sequelize.fn("ST_MakePoint", order.long || 0, order.lat || 0),
                        ),
                        "distance"],
                    ] : []),
                ]
            }
        );

        return staffs;
    }

    prepareStore(staffs) {
        let storeIds = staffs.map(item => item.storeId);
        if(!storeIds || !storeIds.length) return [];
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
		let forwarders = (recommendStaffs || [])?.filter(staff => !staff.storeId).map(item => ({
			status: OrderForwarderStatus.Begin,
			isAccepted: false,
			orderId: order.id,
			staffId: item.id,
			expiredAt: expiredAt,
			createdAt: cur,
			updatedAt: cur,
			storeId: 0,
			type: OrderForwarderType.Normal,
			timerTime: order.timerTime,
		}));
		for (let store of stores) {
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

    async notiOrderForwardStaffs(staffs, order) {
        try {
            //noti 
            console.log("staffs", staffs);
            let userIds = [...new Set([...staffs.map(item => item.userId).filter(val => val)])];
            let content = `Có đơn mới ở ${order.address}. Bạn có thể ứng tuyển`;
            console.log("usrIds ===", userIds);
    
            await this.communicationService.sendBulkNotificationToUserId(userIds, "Thông báo", content, NotificationType.OrderDetail, {actionType: NotificationActionType.OrderDetail.type}, order.id);
            await this.communicationService.sendBulkMobileNotification(userIds, "Thông báo", content);
    
            console.log(`==== [OrderForwardStarter] done notify forwarders`);
        }
        catch (err) {
            console.error(err);
        }
    }
}

module.exports = {
    OrderForwarderService
}