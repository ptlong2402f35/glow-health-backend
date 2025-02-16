var express = require("express");
var router = express.Router();
const Middleware = require("../services/middleware");

//test connect
router.get("/test", AuthController.test);

