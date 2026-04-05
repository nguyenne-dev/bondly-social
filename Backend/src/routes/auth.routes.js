const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// Đăng nhập (hỗ trợ cả /login và /sign-in)
router.post("/login", authController.login);
router.post("/sign-in", authController.login);

// Đăng ký (hỗ trợ cả /register và /send-verify-mail)
router.post("/register", authController.sendVerifyMail);
router.post("/send-verify-mail", authController.sendVerifyMail);

// Xác thực tài khoản (hỗ trợ cả OTP 6 số và Token Link)
router.post("/verify-otp", authController.verifyOtpCode);
router.get("/verify", authController.verifyAndCreateUser);

// Quên mật khẩu & Đặt lại mật khẩu
router.post("/send-repass-email", authController.sendResetPasswordEmail);
router.post("/reset-password", authController.rePass);

module.exports = router;