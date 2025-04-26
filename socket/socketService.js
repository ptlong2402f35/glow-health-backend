
class SocketService {
    ioInstance;
    constructor() {
        this.ioInstance = _io;
    }

    send(room, event, data) {
        this.ioInstance.to(room).emit(event, data);
        console.log(`Done emit socket event ${event} for userId ${room}`);
    }

    listen(event, data) {
        //do nothing
    }
}

module.export = {
    SocketService
}