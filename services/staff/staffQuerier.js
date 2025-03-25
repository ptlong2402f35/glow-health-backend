const { Op } = require("sequelize");
const { sequelize } = require("../../model");

const User = require("../../model").User;
const Staff = require("../../model").Staff;
const Store = require("../../model").Store;
const StaffService = require("../../model").StaffService;
const Service = require("../../model").Service;

class StaffQuerier {
    constructor() {}

    buildQuerier({
        phone,
        name,
        storeId,
        punishType,
        useCoordinate,
        coordinateLat,
        coordinateLong,
        coordinateDistance,
        useLocationCoordinate,
        provinceIds,
        districtIds,
        communeIds,
    }) {
        return {
            phone,
            name,
            storeId: storeId ? parseInt(storeId) : null,
            punishType: punishType ? parseInt(punishType) : null,
            useCoordinate: useCoordinate === "true",
            coordinateLat: coordinateLat ? parseFloat(coordinateLat) : null,
            coordinateLong: coordinateLong ? parseFloat(coordinateLong) : null,
            coordinateDistance: coordinateDistance ? parseFloat(coordinateDistance) : null,
            useLocationCoordinate: useLocationCoordinate === "true",
            provinceIds: provinceIds ? provinceIds.split(";") : null,
            districtIds: districtIds ? districtIds.split(";") : null,
            communeIds: communeIds ? communeIds.split(";") : null,
            
        }
    }

    async buildWhere(
        {
            phone,
            name,
            storeId,
            punishType,
            useCoordinate,
            coordinateLat,
            coordinateLong,
            coordinateDistance,
            useLocationCoordinate,
            provinceIds,
            districtIds,
            communeIds,

        }
    ) {
        let conds = [];

        if(phone) {
            let users = await User.findAll({
                where: {
                    phone: {
                        [Op.iLike]: `%${phone}%`
                    }
                }
            });

            let userIds = users.map(item => item.id).filter(val => val);
            conds = [...conds, {userId: { [Op.in]: userIds }}];
        }

        if(name) {
            conds = [
                ...conds,
                {
                    name: {
                        [Op.iLike]: `%${name}%`
                    }
                }
            ];
        }

        if(storeId) {
            conds = [
                ...conds,
                {
                    storeId: storeId
                }
            ];
        }

        if(punishType) {
            conds = [
                ...conds,
                {
                    punishType: punishType
                }
            ]
        }

        let locationConds = [];
        if (useCoordinate && coordinateDistance && !useLocationCoordinate) {
			locationConds = [
				...locationConds,
				sequelize.where(
					sequelize.fn(
						"ST_DWithin",
						sequelize.literal(`"coordinate"::geography`),
						sequelize.fn("ST_MakePoint", coordinateLong || 0, coordinateLat || 0),
						coordinateDistance,
					),
					true,
				),
			];

            conds = [...conds, ...locationConds];
		}

        if(provinceIds) {
            conds = [...conds, {provinceId: {[Op.in]: provinceIds}}]
        }
        if(districtIds) {
            conds = [...conds, {districtId: {[Op.in]: districtIds}}]
        }
        if(communeIds) {
            conds = [...conds, {communeId: {[Op.in]: provinceIds}}]
        }

        return conds;
    }

    buildSort({
        sortDistance,
        useCoordinate,
        sortId
    }) {
        let sort = [];

        if(sortId) {
            sort = [["id", "desc"], ...sort];
        }

        if(sortDistance && useCoordinate) {
			sort = [sequelize.literal("distance asc"), ...sort];
        }

        return sort;
    }

    buildAttributes({
        useCoordinate, coordinateLong, coordinateLat
    }) {
        let attributes = [
            "name",
            "userId",
            "age",
            "gender",
            "images",
            "active",
            "address",
            "lat",
            "long",
            "coordinate",
            "online",
            "description",
            "storeId",
            "staffRole",
            "busy",
            "provinceId",
            "districtId",
            "communeId",
            "rateAvg",
            "countReview",
            "type",
            "serviceIds",
            "serviceGroupIds",
        ];

        if(useCoordinate) {
            attributes = [
                ...attributes,
                [
                    sequelize.fn(
                        "ST_DistanceSphere",
						sequelize.col("coordinate"),
						sequelize.fn("ST_MakePoint", coordinateLong || 0, coordinateLat || 0),
                    ),
                    "distance"
                ],
            ];
        }

        return attributes;
    }

    async buildIncludes({ includeStaffServices }) {
		return [
			{
				model: User,
				as: "user",
			},
			...(includeStaffServices
				? [
						{
							model: StaffService,
							as: "staffService",
							attributes: ["id", "name"],
							include: [
								{
									model: Service,
									as: "service",
									attributes: ["id", "price", "unit", "name", "imageUrl"],
								},
							],
						},
				  ]
				: []),
			{
				model: Store,
				as: "store",
				attributes:["id", "name", "storeStation"],
			},
		];
	}
}

module.exports = {
    StaffQuerier
}