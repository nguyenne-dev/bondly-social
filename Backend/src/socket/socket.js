const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const chatService = require('../services/chat.service');

// Map lưu trữ userId -> Set các socketId (để hỗ trợ 1 user mở nhiều tab)
const userSocketMap = new Map();

// Helper lấy socketIds của 1 user
const getReceiverSocketIds = (userId) => {
  if (!userId) return [];
  const sockets = userSocketMap.get(userId.toString());
  return sockets ? Array.from(sockets) : [];
};

// Helper lấy danh sách tất cả online userIds
const getOnlineUserIds = () => {
  return Array.from(userSocketMap.keys());
};

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.URL_FE,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Socket Middleware: Xác thực JWT Token
  io.use((socket, next) => {
    try {
      let token = socket.handshake.auth?.token;

      // Nếu không có trong auth handshake, kiểm tra cookie
      if (!token && socket.handshake.headers.cookie) {
        const cookies = socket.handshake.headers.cookie.split(';');
        const tokenCookie = cookies.find((c) => c.trim().startsWith('token='));
        if (tokenCookie) {
          token = tokenCookie.split('=')[1].trim();
        }
      }

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user?._id || socket.user?.id;
    if (!userId) return;

    const userKey = userId.toString();

    // 1. Lưu socket ID vào map
    if (!userSocketMap.has(userKey)) {
      userSocketMap.set(userKey, new Set());
    }
    userSocketMap.get(userKey).add(socket.id);

    console.log(`🟢 User connected: ${socket.user?.username || userKey} (Socket: ${socket.id})`);

    // 2. Broadcast danh sách user online cho toàn bộ client
    io.emit('get_online_users', getOnlineUserIds());

    // ==========================================
    // Realtime Event: Gửi tin nhắn (send_message)
    // ==========================================
    socket.on('send_message', async (data, callback) => {
      try {
        const { receiverId, text, media } = data;
        const senderId = userId;

        if (!receiverId || (!text?.trim() && !media?.url)) {
          if (callback) callback({ success: false, message: 'Dữ liệu không hợp lệ' });
          return;
        }

        // Lưu vào MongoDB
        const result = await chatService.createMessage({
          senderId,
          receiverId,
          text,
          media,
        });

        // Gửi realtime cho người nhận (nếu online)
        const receiverSockets = getReceiverSocketIds(receiverId);
        receiverSockets.forEach((sockId) => {
          io.to(sockId).emit('receive_message', {
            message: result.message,
            conversationId: result.conversationId,
          });
          io.to(sockId).emit('conversation_updated', {
            conversationId: result.conversationId,
            lastMessage: result.message,
          });
        });

        // Gửi lại cho các tab khác của chính người gửi
        const senderSockets = getReceiverSocketIds(senderId);
        senderSockets.forEach((sockId) => {
          if (sockId !== socket.id) {
            io.to(sockId).emit('receive_message', {
              message: result.message,
              conversationId: result.conversationId,
            });
          }
          io.to(sockId).emit('conversation_updated', {
            conversationId: result.conversationId,
            lastMessage: result.message,
          });
        });

        if (callback) {
          callback({ success: true, data: result });
        }
      } catch (err) {
        console.error('Socket send_message error:', err);
        if (callback) callback({ success: false, message: err.message });
      }
    });

    // ==========================================
    // Realtime Event: Đang gõ phím (typing indicator)
    // ==========================================
    socket.on('typing', ({ receiverId, conversationId }) => {
      const receiverSockets = getReceiverSocketIds(receiverId);
      receiverSockets.forEach((sockId) => {
        io.to(sockId).emit('user_typing', {
          senderId: userId,
          conversationId,
          username: socket.user?.username,
          fullName: socket.user?.fullName,
        });
      });
    });

    socket.on('stop_typing', ({ receiverId, conversationId }) => {
      const receiverSockets = getReceiverSocketIds(receiverId);
      receiverSockets.forEach((sockId) => {
        io.to(sockId).emit('user_stop_typing', {
          senderId: userId,
          conversationId,
        });
      });
    });

    // ==========================================
    // Realtime Event: Đánh dấu đã đọc (read receipt)
    // ==========================================
    socket.on('mark_as_read', async ({ conversationId, senderId }) => {
      try {
        const result = await chatService.markMessagesAsRead(conversationId, userId);

        // Báo cho người gửi biết tin nhắn của họ đã được xem
        const senderSockets = getReceiverSocketIds(senderId);
        senderSockets.forEach((sockId) => {
          io.to(sockId).emit('messages_read_receipt', {
            conversationId,
            readerId: userId,
            readAt: result.readAt,
          });
        });
      } catch (err) {
        console.error('Socket mark_as_read error:', err);
      }
    });

    // ==========================================
    // Realtime Event: Thu hồi tin nhắn (recall_message)
    // ==========================================
    socket.on('recall_message', async ({ messageId, receiverId, conversationId }, callback) => {
      try {
        const recalledMessage = await chatService.recallMessage(messageId, userId);

        const payload = {
          messageId,
          conversationId,
          recalledMessage,
        };

        // Gửi cho người nhận
        const receiverSockets = getReceiverSocketIds(receiverId);
        receiverSockets.forEach((sockId) => {
          io.to(sockId).emit('message_recalled', payload);
        });

        // Gửi cho người gửi
        const senderSockets = getReceiverSocketIds(userId);
        senderSockets.forEach((sockId) => {
          io.to(sockId).emit('message_recalled', payload);
        });

        if (callback) callback({ success: true, data: recalledMessage });
      } catch (err) {
        console.error('Socket recall_message error:', err);
        if (callback) callback({ success: false, message: err.message });
      }
    });

    // ==========================================
    // Realtime Event: Thả cảm xúc (react_message)
    // ==========================================
    socket.on('react_message', async ({ messageId, receiverId, emoji, conversationId }, callback) => {
      try {
        const updatedMessage = await chatService.reactToMessage(messageId, userId, emoji);

        const payload = {
          messageId,
          conversationId,
          message: updatedMessage,
        };

        const receiverSockets = getReceiverSocketIds(receiverId);
        receiverSockets.forEach((sockId) => {
          io.to(sockId).emit('message_reaction_updated', payload);
        });

        const senderSockets = getReceiverSocketIds(userId);
        senderSockets.forEach((sockId) => {
          io.to(sockId).emit('message_reaction_updated', payload);
        });

        if (callback) callback({ success: true, data: updatedMessage });
      } catch (err) {
        console.error('Socket react_message error:', err);
        if (callback) callback({ success: false, message: err.message });
      }
    });

    // ==========================================
    // Realtime Event: Thông báo Kết bạn
    // ==========================================
    socket.on('friend_request_sent', ({ receiverId, requestData }) => {
      const receiverSockets = getReceiverSocketIds(receiverId);
      receiverSockets.forEach((sockId) => {
        io.to(sockId).emit('new_friend_request', {
          sender: socket.user,
          request: requestData,
        });
      });
    });

    socket.on('friend_request_accepted', ({ senderId, newFriend }) => {
      const senderSockets = getReceiverSocketIds(senderId);
      senderSockets.forEach((sockId) => {
        io.to(sockId).emit('friend_request_was_accepted', {
          friend: newFriend || socket.user,
        });
      });
    });

    // ==========================================
    // Disconnect: Xử lý khi ngắt kết nối
    // ==========================================
    socket.on('disconnect', () => {
      const userSockets = userSocketMap.get(userKey);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          userSocketMap.delete(userKey);
          console.log(`🔴 User offline: ${socket.user?.username || userKey}`);
        }
      }

      // Broadcast danh sách online mới
      io.emit('get_online_users', getOnlineUserIds());
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO is not initialized!');
  }
  return io;
};

module.exports = {
  initSocket,
  getIO,
  getReceiverSocketIds,
  getOnlineUserIds,
};
