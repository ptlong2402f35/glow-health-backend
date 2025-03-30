var express = require("express");
var router = express.Router();
const Middleware = require("../services/middleware");
const AuthController = require("../controllers/AuthController");
const auth = require("../services/auth/auth");
const CustomerAddressController = require("../controllers/CustomerAddressController");
const UserController = require("../controllers/UserController");
const PaymentController = require("../controllers/PaymentController");
const NotificationController = require("../controllers/NotificationController");
const TransactionController = require("../controllers/TransactionController");
const StaffController = require("../controllers/StaffController");
const StoreController = require("../controllers/StoreController");
const ServiceController = require("../controllers/ServiceController");
const StaffServiceController = require("../controllers/StaffServiceController");
const ServiceGroupController = require("../controllers/ServiceGroupController");
const VourcherController = require("../controllers/VourcherController");
//test connect
router.get("/test", AuthController.test);

/* Auth Controllers */
router.post("/auth/login", Middleware.loginLimit , AuthController.login);
router.post("/auth/login-dev", AuthController.loginForDev);
router.post("/auth/signup", AuthController.signup);
router.get("/auth/me", auth.auth, AuthController.me);
router.post("/auth/refresh", AuthController.refresh);

/*User Controllers */
router.post("/user/create", auth.onlyAdmin, UserController.adminCreateUser);
router.get("/user/admin-get-user", auth.onlyAdmin, UserController.adminGetUser);
router.get("/user/admin-get-detail/:id", auth.onlyAdmin, UserController.adminGetUserDetail);
router.get("/user/my-detail-user", auth.auth, UserController.getMyUserDetail);
router.post("/user/admin-unactive", auth.onlyAdmin, UserController.adminUnactiveUser);
router.put("/user/update-password", auth.auth, UserController.updatePassword);
router.put("/user/update", auth.auth, UserController.updateUserInfo);
router.post("/user/unactive", auth.auth, UserController.unactiveAccount);

/* CustomerAddress */
router.get("/customer-address/my-address", auth.auth, CustomerAddressController.userGetAddress);
router.post("/customer-address/add-address", auth.auth, CustomerAddressController.userCreateAddress);
router.put("/customer-address/update-address", auth.auth, CustomerAddressController.userUpdateAddress);
router.delete("/customer-address/remove-address", auth.auth, CustomerAddressController.userRemoveAddress);

/* Payment */
router.get("/payment/payment-method", PaymentController.getPaymentMethod);
router.post("/payment/recharge", auth.auth, PaymentController.userRecharge);

/* Notification */
router.get("/notification/my-noti", auth.auth, NotificationController.getMyNoti);
router.post("/notification/read-noti", auth.auth, NotificationController.updateNotiRead);

/* Transaction */
router.get("/transaction/admin-get-trans", auth.onlyAdmin, TransactionController.adminGetTrans);
router.get("/transaction/admin-create-trans", auth.onlyAdmin, TransactionController.adminCreateTrans);
router.get("/transaction/my-trans", auth.auth, TransactionController.getMyTrans);
router.get("/transaction/my-trans-detail/:transId", auth.auth, TransactionController.getMyDetailTrans);

/* Staff Controllers */
router.get("/staff-by-admin", auth.onlyAdmin, StaffController.adminGetStaff);
router.get("/staff-by-admin/:id", auth.onlyAdmin, StaffController.adminGetStaffDetail);
router.post("/staff-by-admin", auth.onlyAdmin, StaffController.adminCreateStaff);
router.put("/staff-by-admin", auth.onlyAdmin, StaffController.adminUpdateStaff);
router.put("/deactive-staff-by-admin/:id", auth.onlyAdmin, StaffController.adminDeactiveStaff);
router.get("/staff", StaffController.getStaff);
router.get("/staff-detail/:id", StaffController.getStaffDetail);
router.put("/staff-signup", auth.auth, StaffController.staffRegister);
router.put("/staff", auth.auth, StaffController.updateMyStaffDetail);
router.get("/store-owner/staff", auth.auth, StaffController.ownerGetStaffs);
router.get("/store-owner/staff/:id", auth.auth, StaffController.ownerGetDetailStaff);
router.post("/store-owner/staff", auth.auth, StaffController.ownerCreateStaff);
router.put("/store-owner/staff/:id", auth.auth, StaffController.ownerUpdateStaffDetail);
router.delete("/store-owner/remove-staff/:id", auth.auth, StaffController.ownerRemoveStaff);
router.get("/store-owner/staff-forward-ready", auth.auth, StaffController.ownerGetStaffReady);

/* Store Controllers */
router.get("/store-by-admin", auth.onlyAdmin, StoreController.adminGetStore);
router.get("/store-by-admin/:id", auth.onlyAdmin, StoreController.adminGetStoreDetail);
router.post("/store-by-admin", auth.onlyAdmin, StoreController.adminCreateStore);
router.put("/store-by-admin", auth.onlyAdmin, StoreController.adminUpdateStore);
router.delete("/store-by-admin", auth.onlyAdmin, StoreController.adminRemoveStore);

/* Staff Service Controllers */
router.get("/staff-service-batch-by-admin", auth.onlyAdmin, StaffServiceController.adminGetStaffService);
router.post("/staff-service-batch-by-admin", auth.onlyAdmin, StaffServiceController.adminCreateStaffService);
router.put("/staff-service-batch-by-admin/:id", auth.onlyAdmin, StaffServiceController.adminUpdateStaffService);
router.delete("/staff-service-by-admin/:id", auth.onlyAdmin, StaffServiceController.adminRemoveStaffService);
router.get("/staff-service-batch", auth.auth, StaffServiceController.getMyStaffService );
router.put("/staff-service-batch/:id", auth.auth, StaffServiceController.updateMyStaffService);
router.delete("/staff-service/:id", auth.auth , StaffServiceController.deleteMyStaffService);

/* Service Group Controller */
router.get("/service-group", ServiceGroupController.getServiceGroup);
router.post("/service-group", auth.onlyAdmin, ServiceGroupController.createServiceGroup );
router.put("/service-group/:id", auth.onlyAdmin, ServiceGroupController.updateServiceGroup);
router.delete("/service-group/:id", auth.onlyAdmin, ServiceGroupController.removeServiceGroup);

/* Service Controllers */
router.get("/service", ServiceController.getService);
router.post("/service", auth.onlyAdmin, ServiceController.createService);
router.put("/service/:id", auth.onlyAdmin, ServiceController.updateService);
router.delete("/service/:id", auth.onlyAdmin, ServiceController.removeService);

/* Vourcher Controllers */
router.get("/vourcher", auth.onlyAdmin, VourcherController.getVourcher);
router.post("/vourcher", auth.onlyAdmin, VourcherController.createVourcher );
router.put("/vourcher/:id", auth.onlyAdmin, VourcherController.updateVourcher);
router.delete("/vourcher/:id", auth.onlyAdmin, VourcherController.removeVourcher);
router.put("/vourcher-status/:id", auth.onlyAdmin, VourcherController.updateVourcherStatus);

/* Order Controllers */
router.get("/order-by-admin", auth.onlyAdmin);
router.get("/order-by-admin/:id", auth.onlyAdmin);
router.get("/order-cancel-reason-by-admin/:id", auth.onlyAdmin);
router.post("/finish-order-by-admin/:id", auth.onlyAdmin);
router.post("/cancel-order-by-admin/:id", auth.onlyAdmin);
router.get("/my-order", auth.auth);
router.get("/my-order/:id", auth.auth);
router.post("/order", auth.auth);
router.post("/cancel-my-order/:id", auth.auth);
router.post("order-switch-to-forwarder", auth.auth);
router.get("/order", auth.auth);
router.get("/order/:id", auth.auth);
router.put("/order-ready/:id", auth.auth);
router.put("/order-reject", auth.auth);
router.put("/order-cancel", auth.auth);
router.put("/cancel-my-order", auth.auth);
router.put("/review-my-order", auth.auth);
router.get("/store-owner/order", auth.auth);
router.get("/store-owner/order/:id", auth.auth);
router.put("/store-owner/order-forwarder-ready/:id", auth.auth);
router.put("/store-owner/order-forwarder-reject/:id", auth.auth);

module.exports = router;