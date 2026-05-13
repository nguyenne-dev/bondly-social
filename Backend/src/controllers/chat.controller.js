const chatService = require('../services/chat.service');
const { responseOK, responseNG } = require('../utils/respone.util');

const User = require('../models/users.model');

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

// Lấy hoặc tạo cuộc trò chuyện với 1 user cụ thể (chỉ trả về draft nếu chưa có tin nhắn)
exports.getOrCreateConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { partnerId } = req.params;

    if (!partnerId) {
      return responseNG(res, 'Vui lòng cung cấp ID bạn chat', 400);
    }

    const conversation = await chatService.findConversation(userId, partnerId);
    if (conversation) {
      return responseOK(res, 'Lấy thông tin cuộc trò chuyện thành công', conversation);
    }

    // Nếu chưa có hội thoại trong DB, lấy thông tin partner để hiển thị giao diện draft
    const partner = await User.findById(partnerId).select('username fullName avatar status bio');
    if (!partner) {
      return responseNG(res, 'Không tìm thấy người dùng này', 404);
    }

    const draftConversation = {
      _id: `draft_${partnerId}`,
      isDraft: true,
      participants: [
        { _id: userId, username: req.user.username },
        partner
      ],
      lastMessage: null,
      unreadCounts: new Map(),
    };

    return responseOK(res, 'Khởi tạo cuộc hội thoại nháp', draftConversation);
  } catch (err) {
    console.error('Lỗi khi tìm/tạo cuộc trò chuyện:', err);
    return responseNG(res, err.message || 'Lỗi server', 500);
  }
};

// Lấy danh sách tin nhắn của 1 cuộc trò chuyện (cursor-based pagination)
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
    const cursor = req.query.cursor || null;

    if (!conversationId) {
      return responseNG(res, 'Vui lòng cung cấp ID cuộc trò chuyện', 400);
    }

    const data = await chatService.getConversationMessages(conversationId, limit, cursor, req.user._id);
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

// Xóa tin nhắn một bên (chỉ ẩn phía user hiện tại, không xóa DB, có thể hoàn tác)
exports.deleteMessageForMe = async (req, res) => {
  try {
    const userId = req.user._id;
    const { messageId } = req.params;

    if (!messageId) {
      return responseNG(res, 'Vui lòng cung cấp ID tin nhắn', 400);
    }

    const result = await chatService.deleteMessageForMe(messageId, userId);
    return responseOK(res, 'Đã xóa tin nhắn ở phía bạn thành công', result);
  } catch (err) {
    console.error('Lỗi khi xóa tin nhắn một bên:', err);
    return responseNG(res, err.message || 'Lỗi server', 400);
  }
};

// Hoàn tác xóa tin nhắn một bên
exports.undoDeleteMessageForMe = async (req, res) => {
  try {
    const userId = req.user._id;
    const { messageId } = req.params;

    if (!messageId) {
      return responseNG(res, 'Vui lòng cung cấp ID tin nhắn', 400);
    }

    const result = await chatService.undoDeleteMessageForMe(messageId, userId);
    return responseOK(res, 'Đã hoàn tác xóa tin nhắn thành công', result);
  } catch (err) {
    console.error('Lỗi khi hoàn tác xóa tin nhắn:', err);
    return responseNG(res, err.message || 'Lỗi server', 400);
  }
};
