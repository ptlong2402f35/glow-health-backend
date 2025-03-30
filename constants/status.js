const StoreStatus = {
    Active: 1,
    Disabled: 2
}

const VourcherStatus = {
    Active: 1,
    Disactive: 2
}

const OrderStatus = {
    Pending: 1,
    Approved: 2,
    Finished: 3,
    Canceled: 4,
    Denied: 5
}

const OrderForwarderStatus = {
	Unknown: -1,
	Begin: 1,
	End: 2,
	Reject: 3, // forwarder rejected by recommended staff
	Switched: 4, // customer accept and created order with recommended staff
};

module.exports = {
    StoreStatus,
    VourcherStatus,
    OrderStatus,
    OrderForwarderStatus
}