import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../components/common/Toast';
import { api } from '../api/client';
import Sidebar from '../components/chat/Sidebar';
import ChatArea from '../components/chat/ChatArea';
import ProfileDrawer from '../components/chat/ProfileDrawer';
import FriendRequestsModal from '../components/modals/FriendRequestsModal';
import SearchUsersModal from '../components/modals/SearchUsersModal';

export const ChatPage = () => {
  const { user } = useAuth();
  const {
    sendMessageSocket,
    recallMessageSocket,
    reactMessageSocket,
    setOnReceiveMessage,
    setOnConversationUpdated,
    setOnTyping,
    setOnStopTyping,
    setOnReadReceipt,
    setOnMessageRecalled,
    setOnReactionUpdated,
    setOnFriendRequest,
  } = useSocket();
  const { addToast } = useToast();

  // State
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);

  // Friend Requests & Modals State
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [typingPartnerId, setTypingPartnerId] = useState(null);

  // Fetch Conversations List
  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get('chat/conversations');
      const data = Array.isArray(res?.data) ? res.data : [];
      setConversations(data);
      return data;
    } catch (err) {
      console.error('Lỗi khi tải danh sách hội thoại:', err);
      return [];
    }
  }, []);

  // Fetch Messages for active conversation
  const fetchMessages = useCallback(async (convId) => {
    if (!convId) return;
    try {
      setLoadingMessages(true);
      const res = await api.get(`chat/messages/${convId}?limit=100`);
      const msgList = res?.data?.messages || [];
      setMessages(msgList);
    } catch (err) {
      console.error('Lỗi tải tin nhắn:', err);
      addToast('Không thể tải lịch sử tin nhắn', 'error');
    } finally {
      setLoadingMessages(false);
    }
  }, [addToast]);

  // Fetch Friend Requests & Friends List
  const fetchFriendRequests = useCallback(async () => {
    try {
      setLoadingRequests(true);
      const [incoming, sent, friends] = await Promise.all([
        api.get('friend-request/received').catch(() => ({ data: [] })),
        api.get('friend-request/sent').catch(() => ({ data: [] })),
        api.get('friend-request/friends').catch(() => ({ data: [] })),
      ]);

      setIncomingRequests(Array.isArray(incoming?.data) ? incoming.data : []);
      setSentRequests(Array.isArray(sent?.data) ? sent.data : []);
      setFriendsList(Array.isArray(friends?.data) ? friends.data : []);
    } catch (err) {
      console.error('Lỗi tải danh sách bạn bè / lời mời:', err);
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    fetchConversations();
    fetchFriendRequests();
  }, [fetchConversations, fetchFriendRequests]);

  // When active conversation changes, fetch its messages
  useEffect(() => {
    if (activeConversation?._id) {
      fetchMessages(activeConversation._id);
    } else {
      setMessages([]);
    }
  }, [activeConversation?._id, fetchMessages]);

  // Socket Event Listeners Registry
  useEffect(() => {
    // 1. Nhận tin nhắn mới realtime
    setOnReceiveMessage(({ message, conversationId }) => {
      if (activeConversation?._id === conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
      fetchConversations();
    });

    // 2. Cập nhật sidebar conversation
    setOnConversationUpdated(() => {
      fetchConversations();
    });

    // 3. Typing indicator
    setOnTyping(({ senderId, conversationId }) => {
      if (activeConversation?._id === conversationId) {
        setTypingPartnerId(senderId);
      }
    });

    setOnStopTyping(({ conversationId }) => {
      if (activeConversation?._id === conversationId) {
        setTypingPartnerId(null);
      }
    });

    // 4. Read receipt
    setOnReadReceipt(({ conversationId }) => {
      if (activeConversation?._id === conversationId) {
        setMessages((prev) =>
          prev.map((m) => ({ ...m, isRead: true }))
        );
      }
    });

    // 5. Message recalled
    setOnMessageRecalled(({ messageId, recalledMessage }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? recalledMessage : m))
      );
      fetchConversations();
    });

    // 6. Reaction updated
    setOnReactionUpdated(({ messageId, message }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? message : m))
      );
    });

    // 7. Friend Request notification
    setOnFriendRequest(({ sender }) => {
      addToast(`${sender?.fullName || sender?.username} đã gửi lời mời kết bạn cho bạn!`, 'info');
      fetchFriendRequests();
    });
  }, [activeConversation?._id, fetchConversations, fetchFriendRequests, addToast]);

  // Send Message handler
  const handleSendMessage = ({ receiverId, text, media }) => {
    sendMessageSocket(
      {
        receiverId,
        text,
        media,
        conversationId: activeConversation?._id,
      },
      (res) => {
        if (res?.success && res.data?.message) {
          setMessages((prev) => [...prev, res.data.message]);
          fetchConversations();
        }
      }
    );
  };

  // Recall Message handler
  const handleRecallMessage = ({ messageId, receiverId, conversationId }) => {
    recallMessageSocket({ messageId, receiverId, conversationId }, (res) => {
      if (res?.success) {
        addToast('Đã thu hồi tin nhắn', 'info');
      }
    });
  };

  // React Message handler
  const handleReactMessage = ({ messageId, receiverId, emoji, conversationId }) => {
    reactMessageSocket({ messageId, receiverId, emoji, conversationId });
  };

  // Start chat with user directly
  const handleStartChatWithUser = async (partnerId) => {
    try {
      const res = await api.get(`chat/conversations/partner/${partnerId}`);
      if (res?.data) {
        setActiveConversation(res.data);
        fetchConversations();
      }
    } catch (err) {
      addToast('Không thể mở cuộc trò chuyện', 'error');
    }
  };

  // Accept Friend Request
  const handleAcceptRequest = async (requestId) => {
    try {
      await api.put(`friend-request/accept/${requestId}`);
      addToast('Đã chấp nhận lời mời kết bạn!', 'success');
      fetchFriendRequests();
    } catch (err) {
      addToast(err.message || 'Lỗi khi chấp nhận kết bạn', 'error');
    }
  };

  // Reject Friend Request
  const handleRejectRequest = async (requestId) => {
    try {
      await api.put(`friend-request/reject/${requestId}`);
      addToast('Đã từ chối lời mời', 'info');
      fetchFriendRequests();
    } catch (err) {
      addToast(err.message || 'Lỗi khi từ chối', 'error');
    }
  };

  // Cancel Sent Request
  const handleCancelRequest = async (requestId) => {
    try {
      await api.delete(`friend-request/cancel/${requestId}`);
      addToast('Đã hủy lời mời kết bạn', 'info');
      fetchFriendRequests();
    } catch (err) {
      addToast(err.message || 'Lỗi khi hủy lời mời', 'error');
    }
  };

  // Unfriend
  const handleUnfriend = async (friendId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy kết bạn với người này?')) return;
    try {
      await api.delete(`friend-request/unfriend/${friendId}`);
      addToast('Đã hủy kết bạn', 'info');
      setShowProfileDrawer(false);
      fetchFriendRequests();
    } catch (err) {
      addToast(err.message || 'Lỗi khi hủy kết bạn', 'error');
    }
  };

  const partner = activeConversation?.participants?.find(
    (p) => (p._id || p.id) !== (user?._id || user?.id)
  );

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-app)',
      }}
    >
      {/* 1. Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversation={activeConversation}
        onSelectConversation={(conv) => setActiveConversation(conv)}
        onOpenSearchModal={() => setShowSearchModal(true)}
        onOpenRequestsModal={() => setShowRequestsModal(true)}
        pendingRequestsCount={incomingRequests.length}
      />

      {/* 2. Main Chat Area */}
      <ChatArea
        conversation={activeConversation}
        messages={messages}
        loadingMessages={loadingMessages}
        onSendMessage={handleSendMessage}
        onRecallMessage={handleRecallMessage}
        onReactMessage={handleReactMessage}
        onToggleProfile={() => setShowProfileDrawer(!showProfileDrawer)}
        isTyping={typingPartnerId === (partner?._id || partner?.id)}
      />

      {/* 3. Partner Profile Drawer */}
      <ProfileDrawer
        isOpen={showProfileDrawer}
        onClose={() => setShowProfileDrawer(false)}
        partner={partner}
        onUnfriend={handleUnfriend}
      />

      {/* 4. Modals */}
      <FriendRequestsModal
        isOpen={showRequestsModal}
        onClose={() => setShowRequestsModal(false)}
        incomingRequests={incomingRequests}
        sentRequests={sentRequests}
        loading={loadingRequests}
        onAccept={handleAcceptRequest}
        onReject={handleRejectRequest}
        onCancel={handleCancelRequest}
      />

      <SearchUsersModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onStartChatWithUser={handleStartChatWithUser}
        friendsList={friendsList}
      />
    </div>
  );
};

export default ChatPage;
