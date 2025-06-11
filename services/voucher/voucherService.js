
class VoucherService {
    constructor() {}

    build(data) {
        return {
            name: data.name,
            code: data.code,
            reduceValue: data.reduceValue,
            reducePercent: data.reducePercent || 1,
            startAt: data.startAt,
            endAt: data.endAt,
            scope: data.scope,
            staffId: data.staffId,
            storeId: data.storeId,
            status: data.status
        }
    }
}

module.exports = {
    VoucherService
}