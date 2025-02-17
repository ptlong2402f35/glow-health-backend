"use strict";
const { Model } = require("sequelize");
const sequelizePaginate = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
    class Staff extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */

        static associate(models) {
            Staff.belongsTo(models.User, {
                foreignKey: "userId",
                as: "user",
            });
            Staff.hasOne(models.Staff, {
                foreignKey: "ownStaffId",
                constraints: false,
                as: "ownStore",
            });
            Staff.belongsTo(models.Store, {
                foreignKey: "storeId",
                as: "store"
            });
        }
    }
    Staff.init(
        {
            name: DataTypes.TEXT,
            userId: DataTypes.INTEGER,
            age: DataTypes.INTEGER,
            gender: DataTypes.INTEGER,
            images: DataTypes.ARRAY(DataTypes.TEXT),
            active: DataTypes.BOOLEAN,
            address: DataTypes.TEXT,
            lat: DataTypes.DOUBLE,
            long: DataTypes.DOUBLE,
            coordinate: DataTypes.GEOMETRY("POINT"),
            online: DataTypes.BOOLEAN,
            description: DataTypes.TEXT,
            storeId: DataTypes.INTEGER,
            staffRole: DataTypes.INTEGER,
            busy: DataTypes.BOOLEAN,
            provinceId: DataTypes.INTEGER,
            districtId: DataTypes.INTEGER,
            communeId: DataTypes.INTEGER,
            rateAvg: DataTypes.DOUBLE,
            countReview: DataTypes.INTEGER,
            type: DataTypes.INTEGER,
            serviceIds: DataTypes.ARRAY(DataTypes.INTEGER),
            serviceGroupIds: DataTypes.ARRAY(DataTypes.INTEGER),
            createdAt: DataTypes.DATE,
			updatedAt: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: "Staff",
        },
    );
    sequelizePaginate.paginate(Staff);
    return Staff;
};
