var express = require("express");
var router = express.Router();
var userController = require("../controllers/loginController");

// user login requests:
router.post("/login", userController.logUserIn);
router.get("/login/userauthenticationfailed", userController.loginFailure);
router.get("/login/success", userController.loginSuccess);

router.post("/createaccount", userController.createUserAccount);

module.exports = router;
