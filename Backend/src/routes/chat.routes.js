const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Áp dụng authMiddleware cho tất cả các routes chat
router.use(authMiddleware);

// 1. Lấy danh sách các cuộc trò chuyện của user
router.get('/conversations', chatController.getConversations);

// 2. Tìm hoặc tạo cuộc trò chuyện với bạn chat
router.get('/conversations/partner/:partnerId', chatController.getOrCreateConversation);

// 3. Lấy tin nhắn của cuộc trò chuyện
router.get('/messages/:conversationId', chatController.getMessages);

// 4. Gửi tin nhắn mới
router.post('/messages', chatController.sendMessage);

// 5. Đánh dấu đã đọc tin nhắn
router.put('/messages/read/:conversationId', chatController.markAsRead);

// 6. Thu hồi tin nhắn
router.put('/messages/recall/:messageId', chatController.recallMessage);

// 7. Thả cảm xúc emoji
router.post('/messages/react/:messageId', chatController.reactToMessage);

// 8. Xóa tin nhắn một bên (không xóa DB thật)
router.delete('/messages/delete-for-me/:messageId', chatController.deleteMessageForMe);

// 9. Hoàn tác xóa tin nhắn một bên
router.put('/messages/undo-delete/:messageId', chatController.undoDeleteMessageForMe);

module.exports = router;
