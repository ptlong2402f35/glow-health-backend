let LocationConfigData = require("../../resources/location.json");
const LocationType = {
    Province: 1,
    District: 2,
    Commune: 3
}
const LocationPriority = new Map([
    [LocationType.Province, 5],
    [LocationType.District, 4],
    [LocationType.Commune, 3],
])

class LocationConfig {
    static instance;
    config;
    constructor() {
        
    }

    getInstance() {
        if(LocationConfig.instance == null) {
            LocationConfig.instance = new LocationConfig();
        }

        return LocationConfig.instance;
    }

    init() {
        this.config = LocationConfigData.map(val => ({...val}));
    }

    getLocationSearchIds(ids, type) {
        switch(type) {
            case LocationType.Province:
                return this.config.map(val => 
                    ({
                        id: val.id,
                        name: val.name,
                        longitude: val.longitude,
                        latitude: val.latitude,
                        priority: LocationPriority.get(LocationType.Province)
                    })
                );
            case LocationType.District:
                {
                    let province = this.config.find(val => val.id == ids[0]);
                    return province.districts.map(val => 
                        ({
                            id: val.id,
                            name: val.name,
                            longitude: val.longitude,
                            latitude: val.latitude,
                            priority: LocationPriority.get(LocationType.District)
                        })
                    );
                }
            case LocationType.Commune:
                {
                    let province = this.config.find(val => val.id == ids[0]);
                    let district = province.districts.find(val => val.id == ids[1]);
                    return district.communes.map(val => 
                        ({
                            id: val.id,
                            name: val.name,
                            longitude: val.longitude,
                            latitude: val.latitude,
                            priority: LocationPriority.get(LocationType.Commune)
                        })
                    );
                }
            default:
                return [];
        }
    }

    
}

module.exports = {
    LocationConfig,
    LocationPriority,
    LocationType
};