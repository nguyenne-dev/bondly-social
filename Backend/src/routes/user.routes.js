const express = require("express");
const router = express.Router();
const checkAuth = require("../middlewares/auth.middleware");

const userController = require("../controllers/users.controller");

router.get("/me", checkAuth, userController.getMe); // Lấy thông tin chính mình check theo token
router.get("/all", checkAuth, userController.getAllUser); // Lấy tất cả người dùng

router.post("/me/update", checkAuth,userController.updateInfo) // Cập nhật thông tin
router.post("/me/change-pass", checkAuth,userController.changePassword) // Cập nhật mật khẩu

router.get("/search-user", checkAuth, userController.searchUsers); // Tìm user
router.get("/friend/all", checkAuth, userController.getFriends); // Danh sách bạn bè

module.exports = router;
