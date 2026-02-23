const chatService = require('../services/chat.service');
const { responseOK, responseNG } = require('../utils/respone.util');

// Lấy danh sách cuộc trò chuyện
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = await chatService.getUserConversations(userId);
    return responseOK(res, 'Lấy danh sách cuộc trò chuyện thành công', conversations);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách cuộc trò chuyện:', err);
    return responseNG(res, err.message || 'Lỗi server', 500);
  }
};

// Lấy hoặc tạo cuộc trò chuyện với 1 user cụ thể
exports.getOrCreateConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { partnerId } = req.params;

    if (!partnerId) {
      return responseNG(res, 'Vui lòng cung cấp ID bạn chat', 400);
    }

    const conversation = await chatService.getOrCreateConversation(userId, partnerId);
    return responseOK(res, 'Lấy thông tin cuộc trò chuyện thành công', conversation);
  } catch (err) {
    console.error('Lỗi khi tìm/tạo cuộc trò chuyện:', err);
    return responseNG(res, err.message || 'Lỗi server', 500);
  }
};

// Lấy danh sách tin nhắn của 1 cuộc trò chuyện
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;

    if (!conversationId) {
      return responseNG(res, 'Vui lòng cung cấp ID cuộc trò chuyện', 400);
    }

    const data = await chatService.getConversationMessages(conversationId, page, limit);
    return responseOK(res, 'Lấy tin nhắn thành công', data);
  } catch (err) {
    console.error('Lỗi khi lấy tin nhắn:', err);
    return responseNG(res, err.message || 'Lỗi server', 500);
  }
};

// Gửi tin nhắn qua REST API (hỗ trợ cả REST lẫn Socket)
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId, text, media } = req.body;

    if (!receiverId) {
      return responseNG(res, 'Vui lòng cung cấp người nhận', 400);
    }

    if (!text?.trim() && !media?.url) {
      return responseNG(res, 'Nội dung tin nhắn hoặc file không được để trống', 400);
    }

    const result = await chatService.createMessage({
      senderId,
      receiverId,
      text,
      media,
    });

    return responseOK(res, 'Gửi tin nhắn thành công', result);
  } catch (err) {
    console.error('Lỗi khi gửi tin nhắn:', err);
    return responseNG(res, err.message || 'Lỗi server', 500);
  }
};

// Đánh dấu đã đọc toàn bộ tin nhắn
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    if (!conversationId) {
      return responseNG(res, 'Vui lòng cung cấp ID cuộc trò chuyện', 400);
    }

    const result = await chatService.markMessagesAsRead(conversationId, userId);
    return responseOK(res, 'Đã cập nhật trạng thái đã đọc', result);
  } catch (err) {
    console.error('Lỗi khi cập nhật trạng thái đã đọc:', err);
    return responseNG(res, err.message || 'Lỗi server', 500);
  }
};

// Thu hồi tin nhắn
exports.recallMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { messageId } = req.params;

    if (!messageId) {
      return responseNG(res, 'Vui lòng cung cấp ID tin nhắn cần thu hồi', 400);
    }

    const result = await chatService.recallMessage(messageId, userId);
    return responseOK(res, 'Đã thu hồi tin nhắn thành công', result);
  } catch (err) {
    console.error('Lỗi khi thu hồi tin nhắn:', err);
    return responseNG(res, err.message || 'Lỗi server', 400);
  }
};

// Thả cảm xúc tin nhắn
exports.reactToMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { messageId } = req.params;
    const { emoji } = req.body;

    if (!messageId || !emoji) {
      return responseNG(res, 'Vui lòng cung cấp ID tin nhắn và emoji', 400);
    }

    const result = await chatService.reactToMessage(messageId, userId, emoji);
    return responseOK(res, 'Đã cập nhật cảm xúc tin nhắn', result);
  } catch (err) {
    console.error('Lỗi khi thả cảm xúc tin nhắn:', err);
    return responseNG(res, err.message || 'Lỗi server', 500);
  }
};
