const express = require("express");
const router = express.Router();
const checkAuth = require("../middlewares/auth.middleware");

const userController = require("../controllers/users.controller");

// Lấy thông tin user hiện tại (hỗ trợ cả /me và /profile)
router.get("/me", checkAuth, userController.getMe);
router.get("/profile", checkAuth, userController.getMe);
router.get("/all", checkAuth, userController.getAllUser);

// Cập nhật thông tin profile
router.post("/me/update", checkAuth, userController.updateInfo);
router.put("/profile", checkAuth, userController.updateInfo);
router.post("/me/change-pass", checkAuth, userController.changePassword);

// Tìm kiếm người dùng (hỗ trợ cả /search và /search-user)
router.get("/search", checkAuth, userController.searchUsers);
router.get("/search-user", checkAuth, userController.searchUsers);

// Danh sách bạn bè
router.get("/friends", checkAuth, userController.getFriends);
router.get("/friend/all", checkAuth, userController.getFriends);

// Lấy public profile 1 user theo id (trang cá nhân) — để cuối để không nuốt route tên cố định
router.get("/:id", checkAuth, userController.getUserById);

module.exports = router;

