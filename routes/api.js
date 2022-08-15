var express = require("express");
var router = express.Router();
var userController = require("../controllers/loginController");
var dbQueryController = require("../controllers/dbQueryController");

// user login requests:
router.post("/login", userController.logUserIn);
router.get("/login/userauthenticationfailed", userController.loginFailure);
router.get("/login/success", userController.loginSuccess);

router.post("/createaccount", userController.createUserAccount);

router.get("/getpropertiesdata", dbQueryController.getPropertiesData);

router.get("/getcashaccountdata", dbQueryController.getCashAccountData);

// need to amend to get reqeuest
router.post("/getfxrates", dbQueryController.getFXRate);

router.get("/getcurrencycodes", dbQueryController.getCurrencyData);

router.post(
  "/updatecashaccountbalance",
  dbQueryController.updateAccountBalance
);

router.post("/updatepropertyvalue", dbQueryController.updatePropValue);

module.exports = router;
