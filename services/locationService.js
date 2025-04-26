const LocationConfig = require("../resources/location.json");

class LocationService {
  constructor() {}

  getProvinces(search) {
    return LocationConfig.filter((item) =>
      LocationService.removeAccents(item.name.toLowerCase())?.includes(
        LocationService.removeAccents(search?.toLowerCase())
      )
    ).map((item) => ({
      id: item.id,
      name: item.name,
    }));
  }

  getDistricts(search, provinceId) {
    let list =
      LocationConfig.find((item) => item.id === (provinceId || 1))?.district ||
      [];
    return list
      .filter((item) =>
        LocationService.removeAccents(item.name.toLowerCase())?.includes(
          LocationService.removeAccents(search?.toLowerCase())
        )
      )
      .map((item) => ({
        id: item.id,
        name: item.name,
      }));
  }

  getCommunes(search, provinceId, districtId) {
    if (!provinceId || !districtId) return [];
    let listDistricts =
      LocationConfig.find((item) => item.id === (provinceId || 1))?.district ||
      [];
    let listCom =
      listDistricts.find((item) => item.id === (districtId || 7))?.commune ||
      [];
    return listCom
      .filter((item) =>
        LocationService.removeAccents(item.name.toLowerCase())?.includes(
          LocationService.removeAccents(search?.toLowerCase())
        )
      )
      .map((item) => ({
        id: item.id,
        name: item.name,
      }));
  }

  static removeAccents(str) {
    if (!str) return str;
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  }
}

module.exports = {
  LocationService,
};
