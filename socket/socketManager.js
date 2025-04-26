class SocketManager {
    socketService;
    constructor() {
        this.socketService = new SocketService();
    }

    async sendOrderCreateSocket(userId, data) {
        let event = "order-create-to-staff";
        this.socketService.send(userId, event, data)
    }

    async sendOrderReadySocket(userId, data) {
        let event = "order-ready-to-customer";
        this.socketService.send(userId, event, data)
    }

    async sendOrderCustomerCancelSocket(userId, data) {
        let event = "order-cancel-to-staff";
        this.socketService.send(userId, event, data)
    }

    async sendOrderStaffApproveSocket(userId, data) {
        let event = "order-approve-to-customer";
        this.socketService.send(userId, event, data)
    }

    async sendOrderStaffCancelSocket(userId, data) {
        let event = "order-cancel-to-customer";
        this.socketService.send(userId, event, data)
    }
}

module.exports = {
    SocketManager
}