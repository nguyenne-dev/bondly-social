const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");

const friendController = require("../controllers/friendRequest.controller");

// Lấy danh sách lời mời đã gửi
router.get("/sent", authMiddleware, friendController.getSentFriendRequests);

// Lấy danh sách lời mời đã nhận
router.get("/received", authMiddleware, friendController.getIncomingFriendRequests);

// Gửi lời mời kết bạn
router.post("/send", authMiddleware, friendController.sendRequest);

// Chấp nhận lời mời kết bạn
router.put("/accept/:requestId", authMiddleware, friendController.acceptRequest);

// Từ chối lời mời kết bạn
router.put("/reject/:requestId", authMiddleware, friendController.rejectRequest);

// Huỷ lời mời đã gửi
router.delete("/cancel/:requestId", authMiddleware, friendController.cancelRequest);

// Lấy danh sách bạn bè
router.get("/friends", authMiddleware, friendController.getFriendsList);

// Hủy kết bạn
router.delete("/unfriend/:friendId", authMiddleware, friendController.unfriend);

module.exports = router;
  