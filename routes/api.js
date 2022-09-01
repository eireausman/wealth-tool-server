var express = require("express");
var router = express.Router();
var userController = require("../controllers/loginController");
var dbQueryController = require("../controllers/dbQueryController");

// user login requests:
router.post("/login", userController.logUserIn);
router.get("/login/userauthenticationfailed", userController.loginFailure);
router.get("/login/success", userController.loginSuccess);
router.get("/logout", userController.logUserOut);

router.get("/isuserloggedin", userController.isUserLoggedIn);

router.post("/createaccount", userController.createUserAccount);

router.get("/getpropertiesdata", dbQueryController.getPropertiesData);

router.get("/getcashaccountdata", dbQueryController.getCashAccountData);

// need to amend to get request
router.post("/getfxrates", dbQueryController.getFXRate);

router.get("/getallfxrates", dbQueryController.getallFXRates);

router.get("/getcurrencycodes", dbQueryController.getCurrencyData);

router.post("/addnewinvestment", dbQueryController.addNewInvestment);

router.post("/addnewproperty", dbQueryController.addNewProperty);

router.post("/addnewcashaccount", dbQueryController.addNewCashAccount);

router.get("/gettotalposassets", dbQueryController.getTotalPosAssetValue);

router.get("/getdebttotalvalue", dbQueryController.getDebtTotalValue);

router.post(
  "/updatecashaccountbalance",
  dbQueryController.updateAccountBalance
);

router.get("/getcashaccountnettotal", dbQueryController.getCashAccountNetTotal);

router.get("/getpropertynettotal", dbQueryController.getPropertyNetTotal);

router.get("/getinvestmentsnettotal", dbQueryController.getInvestmentsTotal);

router.get("/getinvestmentdata", dbQueryController.getInvestmentsData);

router.post("/updatepropertyvalue", dbQueryController.updatePropValue);

module.exports = router;
