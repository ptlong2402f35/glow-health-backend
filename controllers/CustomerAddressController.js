const { Op } = require("sequelize");
const { UserNotFound, InputInfoEmpty } = require("../constants/message");
const { ErrorService } = require("../services/errorService");
const { LocationService } = require("../services/locationService");
const User = require("../model").User;
const CustomerAddress = require("../model").CustomerAddress;

class CustomerAddressControler {
  userGetAddress = async (req, res, next) => {
    try {
      let userId = req.user.userId;

      console.log("userId", userId);

      let resp = await CustomerAddress.findAll({
        where: {
          customerUserId: userId,
        },
      });

      return res.status(200).json(resp);
    } catch (err) {
      console.error(err);
      let { code, message } = new ErrorService(req).getErrorResponse(err);
      return res.status(code).json({ message });
    }
  };

  userCreateAddress = async (req, res, next) => {
    try {
      let userId = req.user.userId;
      let data = req.body;
      if (!data.phone || !data.customerName) throw InputInfoEmpty;
      let resp = await CustomerAddress.create({
        ...data,
        active: true,
        default: data.isSetDefault ? true : false,
        customerUserId: userId,
      });

      if(data.isSetDefault) {
        await CustomerAddress.update(
          {
            default: false
          }, {
            where: {
              customerUserId: userId,
              id: {
                [Op.ne]: resp.id,
              }
            }
          }
        )
      }

      return res.status(200).json({ message: "DONE", resp });
    } catch (err) {
      console.error(err);
      let { code, message } = new ErrorService(req).getErrorResponse(err);
      return res.status(code).json({ message });
    }
  };

  userUpdateAddress = async (req, res, next) => {
    try {
      let userId = req.user.userId;
      let data = req.body;
      let id = req.params.id ? parseInt(req.params.id) : null;
      if (!id) throw InputInfoEmpty;

      let resp = await CustomerAddress.update(
        {
          ...data,
          default: data.isSetDefault ? true : false,
        },
        {
          where: {
            customerUserId: userId,
            id,
          },
        }
      );

      if(data.isSetDefault) {
        await CustomerAddress.update(
          {
            default: false
          }, {
            where: {
              customerUserId: userId,
              id: {
                [Op.ne]: id,
              }
            }
          }
        )
      }

      return res.status(200).json({ message: "DONE" });
    } catch (err) {
      console.error(err);
      let { code, message } = new ErrorService(req).getErrorResponse(err);
      return res.status(code).json({ message });
    }
  };

  userRemoveAddress = async (req, res, next) => {
    try {
      let id = req.params.id ? parseInt(req.params.id) : null;
      if (!id) throw InputInfoEmpty;
      let userId = req.user.userId;
      let address = await CustomerAddress.findAll({
        where: {
          customerUserId: userId
        }
      });
      let currentAddress = address.find(item => item.id === id);
      await CustomerAddress.destroy({
        where: {
          id,
          customerUserId: userId,
        },
      });

      if(currentAddress.default) {
        let randomIdx = address.filter(val => val.id != id)?.[0]?.id;
        if(!randomIdx) return;
        await CustomerAddress.update(
          {
            default: true
          },
          {
          where: {
            id: randomIdx,
            customerUserId: userId,
          },
        });
      }

      return res.status(200).json({ message: "DONE" });
    } catch (err) {
      console.error(err);
      let { code, message } = new ErrorService(req).getErrorResponse(err);
      return res.status(code).json({ message });
    }
  };

  userGetAddressDefault = async (req, res, next) => {
    try {
      let userId = req.user.userId;

      console.log("userId", userId);

      let resp = await CustomerAddress.findOne({
        where: {
          customerUserId: userId,
          default: true
        },
      });

      return res.status(200).json(resp);
    } catch (err) {
      console.error(err);
      let { code, message } = new ErrorService(req).getErrorResponse(err);
      return res.status(code).json({ message });
    }
  };

  getProvinceList = async (req, res, next) => {
    try {
      let search = req.query.search
        ? req.query.search?.trim()?.toLowerCase()
        : "";

      let data = new LocationService().getProvinces(search);

      return res.status(200).json(data);
    } catch (err) {
      console.error(err);
      let { code, message } = new ErrorService(req).getErrorResponse(err);
      return res.status(code).json({ message });
    }
  };

  getDistrictList = async (req, res, next) => {
    try {
      let search = req.query.search
        ? req.query.search?.trim()?.toLowerCase()
        : "";
      let provinceId = req.query.provinceId
        ? parseInt(req.query.provinceId)
        : null;

      let data = new LocationService().getDistricts(search, provinceId);

      return res.status(200).json(data);
    } catch (err) {
      console.error(err);
      let { code, message } = new ErrorService(req).getErrorResponse(err);
      return res.status(code).json({ message });
    }
  };

  getCommuneList = async (req, res, next) => {
    try {
      let search = req.query.search
        ? req.query.search?.trim()?.toLowerCase()
        : "";
      let provinceId = req.query.provinceId
        ? parseInt(req.query.provinceId)
        : null;
      let districtId = req.query.districtId
        ? parseInt(req.query.districtId)
        : null;

      let data = new LocationService().getCommunes(
        search,
        provinceId,
        districtId
      );

      return res.status(200).json(data);
    } catch (err) {
      console.error(err);
      let { code, message } = new ErrorService(req).getErrorResponse(err);
      return res.status(code).json({ message });
    }
  };
}

module.exports = new CustomerAddressControler();
