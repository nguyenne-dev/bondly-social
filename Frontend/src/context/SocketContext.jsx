import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

// Ưu tiên VITE_SOCKET_URL; nếu chưa khai báo thì suy ra từ VITE_API_URL
// (trỏ cùng host với backend, tránh hardcode domain production khi demo local)
const apiUrl = import.meta.env.VITE_API_URL || '';
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (apiUrl ? apiUrl.replace(/\/api\/?$/, '') : 'http://localhost:3002');

// Sound effect for new messages using Web Audio API (zero external assets needed)
const playNotificationSound = () => {
  try {
    if (localStorage.getItem('bondly_sound') === 'disabled') return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  } catch (err) {
    // Ignore audio autoplay restrictions
  }
};

export const SocketProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // Message event listeners registry
  const onReceiveMessageRef = useRef(null);
  const onConversationUpdatedRef = useRef(null);
  const onTypingRef = useRef(null);
  const onStopTypingRef = useRef(null);
  const onReadReceiptRef = useRef(null);
  const onMessageRecalledRef = useRef(null);
  const onReactionUpdatedRef = useRef(null);
  const onFriendRequestRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Khởi tạo Socket.IO Client
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('⚡ Socket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('get_online_users', (usersList) => {
      setOnlineUsers(usersList || []);
    });

    // Realtime Message Incoming
    newSocket.on('receive_message', (data) => {
      playNotificationSound();
      if (onReceiveMessageRef.current) {
        onReceiveMessageRef.current(data);
      }
    });

    // Conversation List Update
    newSocket.on('conversation_updated', (data) => {
      if (onConversationUpdatedRef.current) {
        onConversationUpdatedRef.current(data);
      }
    });

    // Typing Indicators
    newSocket.on('user_typing', (data) => {
      if (onTypingRef.current) onTypingRef.current(data);
    });

    newSocket.on('user_stop_typing', (data) => {
      if (onStopTypingRef.current) onStopTypingRef.current(data);
    });

    // Read Receipts
    newSocket.on('messages_read_receipt', (data) => {
      if (onReadReceiptRef.current) onReadReceiptRef.current(data);
    });

    // Message Recalled
    newSocket.on('message_recalled', (data) => {
      if (onMessageRecalledRef.current) onMessageRecalledRef.current(data);
    });

    // Emoji Reactions
    newSocket.on('message_reaction_updated', (data) => {
      if (onReactionUpdatedRef.current) onReactionUpdatedRef.current(data);
    });

    // Friend Request Notifications
    newSocket.on('new_friend_request', (data) => {
      playNotificationSound();
      if (onFriendRequestRef.current) onFriendRequestRef.current(data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, token]);

  // Emitters
  const sendMessageSocket = (payload, callback) => {
    if (socket && isConnected) {
      socket.emit('send_message', payload, callback);
    }
  };

  const sendTypingSocket = (receiverId, conversationId) => {
    if (socket && isConnected) {
      socket.emit('typing', { receiverId, conversationId });
    }
  };

  const sendStopTypingSocket = (receiverId, conversationId) => {
    if (socket && isConnected) {
      socket.emit('stop_typing', { receiverId, conversationId });
    }
  };

  const markAsReadSocket = (conversationId) => {
    if (socket && isConnected) {
      socket.emit('mark_as_read', { conversationId });
    }
  };

  const recallMessageSocket = (payload, callback) => {
    if (socket && isConnected) {
      socket.emit('recall_message', payload, callback);
    }
  };

  const reactMessageSocket = (payload, callback) => {
    if (socket && isConnected) {
      socket.emit('react_message', payload, callback);
    }
  };

  // Thông báo realtime cho người nhận khi gửi / chấp nhận lời mời kết bạn
  const notifyFriendRequestSent = (receiverId, requestData) => {
    if (socket && isConnected) {
      socket.emit('friend_request_sent', { receiverId, requestData });
    }
  };

  const notifyFriendRequestAccepted = (senderId, newFriend) => {
    if (socket && isConnected) {
      socket.emit('friend_request_accepted', { senderId, newFriend });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUsers,
        isUserOnline: (targetId) => targetId && onlineUsers.includes(targetId.toString()),
        sendMessageSocket,
        sendTypingSocket,
        sendStopTypingSocket,
        markAsReadSocket,
        recallMessageSocket,
        reactMessageSocket,
        notifyFriendRequestSent,
        notifyFriendRequestAccepted,
        // Handlers setters
        setOnReceiveMessage: (fn) => { onReceiveMessageRef.current = fn; },
        setOnConversationUpdated: (fn) => { onConversationUpdatedRef.current = fn; },
        setOnTyping: (fn) => { onTypingRef.current = fn; },
        setOnStopTyping: (fn) => { onStopTypingRef.current = fn; },
        setOnReadReceipt: (fn) => { onReadReceiptRef.current = fn; },
        setOnMessageRecalled: (fn) => { onMessageRecalledRef.current = fn; },
        setOnReactionUpdated: (fn) => { onReactionUpdatedRef.current = fn; },
        setOnFriendRequest: (fn) => { onFriendRequestRef.current = fn; },
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
