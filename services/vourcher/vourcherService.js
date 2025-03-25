
class VourcherService {
    constructor() {}

    build(data) {
        return {
            name: data.name,
            code: data.code,
            reduceValue: data.reduceValue,
            reducePercent: data.reducePercent,
            startAt: data.startAt,
            endAt: data.endAt,
            scope: data.scope,
            staffId: data.staffId,
            storeId: data.storeId,
            active: data.active
        }
    }
}

module.exports = {
    VourcherService
}