var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const crypto = require('crypto');
const notiJob = require("./services/job/scheduleNotiJob");

var indexRouter = require("./routes/index");
var api = require("./routes/api");
var cors = require("cors");
const bodyParser = require("body-parser");

var app = express();
app.use(cors());
//view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("common"));

app.use(
	bodyParser.json({
		verify: (req, res, buf) => {
			req.rawBody = buf;
		},
	}),
);

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api", api);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

//listen server
var debug = require("debug")("node-sequelize:server");

var http = require("http");
const { initSocket } = require("./socket/socket");
const { FirebaseConfig } = require("./firebase/firebaseConfig");
const { GeneralRedisClient } = require("./services/generalRedisClient");
const HOST = "0.0.0.0";
// const ChannelPassword = "ccyT7JeiJ2";
require("events").EventEmitter.prototype._maxListeners = 50;

var port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port, HOST);
server.on("error", onError);
server.on("listening", onListening);

function normalizePort(val) {
	var port = parseInt(val, 10);

	if (isNaN(port)) {
		// named pipe
		return val;
	}

	if (port >= 0) {
		// port number
		return port;
	}

	return false;
}
// console.log(crypto.randomBytes(32).toString("hex"))
function onError(error) {
	if (error.syscall !== "listen") {
		throw error;
	}

	var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case "EACCES":
			console.error(bind + " requires elevated privileges");
			process.exit(1);
			break;
		case "EADDRINUSE":
			console.error(bind + " is already in use");
			process.exit(1);
			break;
		default:
			throw error;
	}
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
	var addr = server.address();
	var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
	console.log(`Listening on http://localhost:${addr.port}`);
	debug("Listening on " + bind);
}

new FirebaseConfig().getInstance().init();
notiJob.start();

new GeneralRedisClient()
		.getInstance()
		.getClient();
//connect socket
setTimeout(()=>initSocket(server), 5000);
