const {Server} = require("socket.io");
const ChannelPassword = process.env.CHANNEL_PASSWORD || "12345678";
const auth = require("../services/auth/auth");
function initSocket(server) {
	const io = new Server(server, {
		cors: {
			origin: "*",
		},
	});

	global._io = io;
	global._socketUsers = [];
	
	io.use((socket, next) => {
		const userId = socket.handshake.auth?.userId;
		const token = socket.handshake.auth?.token;
		const channelPassword = socket.handshake.auth?.channelPassword;
	
		if(channelPassword === ChannelPassword) {
			socket.userId = 0;
			socket.isAuthen = true;
		}
		else {
			const isAuthen = auth.checkAuthen(userId, token);
			if (!userId || !isAuthen) {
				return next(new Error("invalid userId"));
			}
			socket.userId = userId;
			socket.isAuthen = isAuthen;
		}
	
		next();
	});
	
	io.on("connection", socket => {
		for (let [id, socket] of io.of("/").sockets) {
			if (socket.isAuthen) {
				_socketUsers.push({
					socketId: id,
					userId: socket.userId,
				});
			}
		}
		//join room
		socket.join(socket.userId);
		console.log(`==== [Socket] User ${socket.userId} connected with socketId ${socket.id}`);
	
		socket.on("disconnect", function () {
			console.log(`==== [Socket] User ${socket.userId} Got disconnect with socketId ${socket.id}`);
			_socketUsers = _socketUsers.filter(el => el.socketId !== socket.id);
		});
	});

	console.log(`[SocketServer] done init`);
}

module.exports = {
    initSocket
}