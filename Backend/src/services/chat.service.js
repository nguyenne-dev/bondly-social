const mongoose = require('mongoose');
const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const User = require('../models/users.model');

class ChatService {
  // Kiểm tra user có phải thành viên của cuộc trò chuyện hay không
  // (ngăn chặn IDOR: truy cập trực tiếp bằng conversationId/messageId của người khác)
  async assertParticipant(userId, conversationId) {
    const conversation = await Conversation.findById(conversationId).select('participants');
    if (!conversation) {
      throw new Error('Cuộc trò chuyện không tồn tại');
    }
    const isMember = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );
    if (!isMember) {
      throw new Error('Bạn không phải thành viên của cuộc trò chuyện này');
    }
    return conversation;
  }

  // Tìm cuộc hội thoại giữa 2 user nếu đã tồn tại
  async findConversation(userId, partnerId) {
    const conversation = await Conversation.findOne({
      participants: { $all: [userId, partnerId], $size: 2 },
    })
      .populate('participants', 'username fullName avatar status bio')
      .populate({
        path: 'lastMessage',
        populate: { path: 'senderId', select: 'username fullName avatar' },
      });

    return conversation;
  }

  // Lấy hoặc tạo mới cuộc hội thoại giữa 2 user
  async getOrCreateConversation(userId, partnerId) {
    let conversation = await this.findConversation(userId, partnerId);

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, partnerId],
        unreadCounts: new Map([[partnerId.toString(), 0], [userId.toString(), 0]]),
      });
      conversation = await Conversation.findById(conversation._id).populate(
        'participants',
        'username fullName avatar status bio'
      );
    }

    return conversation;
  }

  // Lấy danh sách tất cả các cuộc trò chuyện của user (chỉ lấy những cuộc trò chuyện đã có tin nhắn)
  async getUserConversations(userId) {
    const conversations = await Conversation.find({
      participants: userId,
      lastMessage: { $exists: true, $ne: null },
    })
      .populate('participants', 'username fullName avatar status bio')
      .populate({
        path: 'lastMessage',
        populate: { path: 'senderId', select: 'username fullName avatar' },
      })
      .sort({ updatedAt: -1 });

    return conversations;
  }

  // Lấy tin nhắn trong cuộc trò chuyện (lọc bỏ các tin nhắn user đã xóa một bên)
  // Cursor-based pagination: không dùng skip/limit (tránh skip sâu chậm
  // và không ổn định khi nhiều tin trùng createdAt).
  // Cursor có dạng "<createdAt ISO>|<_id>", trỏ tới tin cũ nhất của trang đã tải.
  async getConversationMessages(conversationId, limit = 100, cursor = null, userId = null) {
    // Chỉ thành viên của cuộc trò chuyện mới được đọc tin nhắn
    if (userId) {
      await this.assertParticipant(userId, conversationId);
    }
    const query = { conversationId };
    if (userId) {
      query.deletedFor = { $ne: userId };
    }

    // Nếu có cursor: lấy các tin CŨ HƠN cursor (ngược lịch sử)
    if (cursor) {
      const [cursorCreatedAt, cursorId] = String(cursor).split('|');
      if (cursorCreatedAt && cursorId) {
        query.$or = [
          { createdAt: { $lt: new Date(cursorCreatedAt) } },
          { createdAt: new Date(cursorCreatedAt), _id: { $lt: new mongoose.Types.ObjectId(cursorId) } },
        ];
      }
    }

    // Lấy thêm 1 tin để biết còn trang cũ hơn nữa hay không
    const take = limit + 1;
    const docs = await Message.find(query)
      .populate('senderId', 'username fullName avatar')
      .populate('receiverId', 'username fullName avatar')
      .populate('reactions.userId', 'username fullName avatar')
      // Sort 2 key: createdAt + _id để thứ tự luôn ổn định & tie-breaker duy nhất
      .sort({ createdAt: -1, _id: -1 })
      .limit(take);

    const hasMore = docs.length > limit;
    const pageDocs = hasMore ? docs.slice(0, limit) : docs;

    // Trả về theo thứ tự cũ -> mới để FE render được ngay
    const messages = pageDocs.reverse();

    // Cursor cho trang CŨ HƠN tiếp theo = tin cũ nhất trong trang này
    const oldest = messages[0];
    const nextCursor = oldest
      ? `${oldest.createdAt.toISOString()}|${oldest._id.toString()}`
      : null;

    return {
      messages,
      hasMore,
      nextCursor,
      limit,
    };
  }

  // Gửi tin nhắn mới
  async createMessage({ senderId, receiverId, text, media }) {
    // 1. Tìm hoặc tạo cuộc trò chuyện
    const conversation = await this.getOrCreateConversation(senderId, receiverId);

    // 2. Tạo bản ghi tin nhắn
    const newMessage = await Message.create({
      conversationId: conversation._id,
      senderId,
      receiverId,
      text: text || '',
      media: media || { url: '', type: 'none', name: '', size: 0 },
      isRead: false,
    });

    // 3. Cập nhật lastMessage và unreadCounts trong cuộc trò chuyện
    const unreadKey = receiverId.toString();
    const currentUnread = (conversation.unreadCounts && conversation.unreadCounts.get(unreadKey)) || 0;

    conversation.lastMessage = newMessage._id;
    if (!conversation.unreadCounts) {
      conversation.unreadCounts = new Map();
    }
    conversation.unreadCounts.set(unreadKey, currentUnread + 1);
    conversation.updatedAt = new Date();
    await conversation.save();

    // 4. Trả về tin nhắn đầy đủ thông tin
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('senderId', 'username fullName avatar')
      .populate('receiverId', 'username fullName avatar');

    return {
      message: populatedMessage,
      conversationId: conversation._id,
    };
  }

  // Đánh dấu đã đọc tin nhắn
  async markMessagesAsRead(conversationId, userId) {
    const conversation = await this.assertParticipant(userId, conversationId);
    const readAt = new Date();

    const updateResult = await Message.updateMany(
      {
        conversationId,
        receiverId: userId,
        isRead: false,
      },
      {
        $set: { isRead: true, readAt },
      }
    );

    // Reset unread count cho user trong conversation
    if (conversation && conversation.unreadCounts) {
      conversation.unreadCounts.set(userId.toString(), 0);
      await conversation.save();
    }

    return {
      readCount: updateResult.modifiedCount,
      readAt,
      // Danh sách participant để socket gửi read receipt đúng người
      // (không tin tưởng senderId do client gửi lên)
      participantIds: (conversation.participants || [])
        .map((p) => p.toString())
        .filter((id) => id !== userId.toString()),
    };
  }

  // Thu hồi tin nhắn (xóa với tất cả mọi người, deletedAll = true, isRecalled = true)
  async recallMessage(messageId, userId) {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Tin nhắn không tồn tại');
    }

    if (message.senderId.toString() !== userId.toString()) {
      throw new Error('Bạn chỉ có thể thu hồi tin nhắn của chính mình');
    }

    message.isRecalled = true;
    message.deletedAll = true; // Đánh dấu đã xóa all
    await message.save();

    return message;
  }

  // Xóa tin nhắn ở phía người dùng (xóa một bên, không xóa bản ghi MongoDB thật, có thể hoàn tác)
  async deleteMessageForMe(messageId, userId) {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Tin nhắn không tồn tại');
    }

    await this.assertParticipant(userId, message.conversationId);

    if (!message.deletedFor) {
      message.deletedFor = [];
    }

    const userIdStr = userId.toString();
    const alreadyDeleted = message.deletedFor.some((id) => id.toString() === userIdStr);
    if (!alreadyDeleted) {
      message.deletedFor.push(userId);
      await message.save();
    }

    return message;
  }

  // Hoàn tác xóa tin nhắn một bên (Undo delete for me)
  async undoDeleteMessageForMe(messageId, userId) {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Tin nhắn không tồn tại');
    }

    await this.assertParticipant(userId, message.conversationId);

    if (message.deletedFor && message.deletedFor.length > 0) {
      const userIdStr = userId.toString();
      message.deletedFor = message.deletedFor.filter((id) => id.toString() !== userIdStr);
      await message.save();
    }

    return message;
  }

  // Thả cảm xúc emoji vào tin nhắn
  async reactToMessage(messageId, userId, emoji) {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Tin nhắn không tồn tại');
    }

    await this.assertParticipant(userId, message.conversationId);

    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === userId.toString()
    );

    if (existingReactionIndex > -1) {
      if (message.reactions[existingReactionIndex].emoji === emoji) {
        // Nếu bấm lại cùng emoji -> Hủy reaction
        message.reactions.splice(existingReactionIndex, 1);
      } else {
        // Đổi emoji khác
        message.reactions[existingReactionIndex].emoji = emoji;
      }
    } else {
      // Thêm reaction mới
      message.reactions.push({ userId, emoji });
    }

    await message.save();
    return await Message.findById(messageId)
      .populate('senderId', 'username fullName avatar')
      .populate('reactions.userId', 'username fullName avatar');
  }
}

module.exports = new ChatService();
