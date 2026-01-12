const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");


router.post("/send-verify-mail", authController.sendVerifyMail);
router.get("/verify", authController.verifyAndCreateUser);
router.post("/sign-in", authController.login);
router.post("/send-repass-email", authController.sendResetPasswordEmail);
router.post("/reset-password", authController.rePass);

module.exports = router;