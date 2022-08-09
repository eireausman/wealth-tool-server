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

router.post(
  "/updatecashaccountbalance",
  dbQueryController.updateAccountBalance
);

module.exports = router;
