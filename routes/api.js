var express = require("express");
var router = express.Router();
const Middleware = require("../services/middleware");

//test connect
router.get("/test", AuthController.test);

/* Auth Controllers */
router.post("/auth/login", Middleware.loginLimit , AuthController.login);
router.post("/auth/login-dev", AuthController.loginForDev);
router.post("/auth/signup", AuthController.signup);
router.get("/auth/me", Auth.auth, AuthController.me);
router.post("/auth/refresh", AuthController.refresh);