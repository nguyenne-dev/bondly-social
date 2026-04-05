const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const User = require('../models/users.model');

class ChatService {
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

  // Lấy tin nhắn trong cuộc trò chuyện
  async getConversationMessages(conversationId, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'username fullName avatar')
      .populate('receiverId', 'username fullName avatar')
      .populate('reactions.userId', 'username fullName avatar')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({ conversationId });

    return {
      messages,
      total,
      page,
      totalPages: Math.ceil(total / limit),
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
    const conversation = await Conversation.findById(conversationId);
    if (conversation && conversation.unreadCounts) {
      conversation.unreadCounts.set(userId.toString(), 0);
      await conversation.save();
    }

    return {
      readCount: updateResult.modifiedCount,
      readAt,
    };
  }

  // Thu hồi tin nhắn
  async recallMessage(messageId, userId) {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Tin nhắn không tồn tại');
    }

    if (message.senderId.toString() !== userId.toString()) {
      throw new Error('Bạn chỉ có thể thu hồi tin nhắn của chính mình');
    }

    message.isRecalled = true;
    message.text = 'Tin nhắn đã được thu hồi';
    message.media = { url: '', type: 'none', name: '', size: 0 };
    await message.save();

    return message;
  }

  // Thả cảm xúc emoji vào tin nhắn
  async reactToMessage(messageId, userId, emoji) {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Tin nhắn không tồn tại');
    }

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
