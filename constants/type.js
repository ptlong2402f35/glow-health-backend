const OrderType = {
    Normal: 1,
    QuickForward: 2,
}

const OrderForwarderType = {
    Normal: 1,
    QuickForward: 2,
}

const NotificationType = {
    Transaction: {
        type: 1,
        event: "transaction-noti"
    },
    OrderDetail: {
        type: 2,
        event: "order-detail"
    },
    OrderList: {
        type: 3,
        event: "order-list"
    },
    StaffProfile: {
        type: 4,
        event: "staff-profile"
    },
    StaffServiceInfo: {
        type: 5,
        event: "staff-service-info"
    },
    Home: {
        type: 6,
        event: "home"
    },
    OrderCustomerDetail: {
        type: 7,
        event: "order-customer-detail"
    },
    OrderCustomerList: {
        type: 8,
        event: "order-customer-list"
    },
}

const NotificationActionType = {
    Wallet: {
        type: 1,
        event: "wallet"
    },
    OrderDetail: {
        type: 2,
        event: "order-detail"
    },
    OrderList: {
        type: 3,
        event: "order-list"
    },
    StaffProfile: {
        type: 4,
        event: "staff-profile"
    },
    StaffServiceInfo: {
        type: 5,
        event: "staff-service-info"
    },
    Home: {
        type: 6,
        event: "home"
    },
    OrderCustomerDetail: {
        type: 7,
        event: "order-customer-detail"
    },
    OrderCustomerList: {
        type: 8,
        event: "order-customer-list"
    },
}


module.exports = {
    OrderType,
    OrderForwarderType,
    NotificationType,
    NotificationActionType
}