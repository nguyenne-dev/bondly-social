import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../components/common/Toast';
import Sidebar from '../components/chat/Sidebar';
import ChatArea from '../components/chat/ChatArea';
import ProfileDrawer from '../components/chat/ProfileDrawer';
import FriendRequestsModal from '../components/modals/FriendRequestsModal';
import SearchUsersModal from '../components/modals/SearchUsersModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import { extractPartner } from '../utils/partner';
import { useMobile } from '../hooks/useMobile';
import { useConversations } from '../hooks/useConversations';
import { useFriends } from '../hooks/useFriends';
import { useChat } from '../hooks/useChat';

export const ChatPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();
  const isMobile = useMobile(768);

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

  // 1. Conversations state & actions
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    fetchConversations,
    handleStartChatWithUser,
  } = useConversations();

  // 2. Friends state & actions
  const {
    incomingRequests,
    sentRequests,
    friendsList,
    loadingRequests,
    fetchFriendRequests,
    handleAcceptRequest,
    handleRejectRequest,
    handleCancelRequest,
    executeUnfriend,
  } = useFriends();

  // 3. Chat messages state & actions
  const {
    messages,
    setMessages,
    loadingMessages,
    typingPartnerId,
    setTypingPartnerId,
    handleSendMessage,
    handleRetryMessage,
    handleRecallMessage,
    handleReactMessage,
    handleDeleteMessageForMe,
  } = useChat({
    user,
    activeConversation,
    setActiveConversation,
    sendMessageSocket,
    recallMessageSocket,
    reactMessageSocket,
    fetchConversations,
  });

  // UI Drawer & Modals state
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    confirmType: 'danger',
    onConfirm: () => {},
  });

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
  }, [
    activeConversation?._id,
    fetchConversations,
    fetchFriendRequests,
    setMessages,
    setTypingPartnerId,
    setOnReceiveMessage,
    setOnConversationUpdated,
    setOnTyping,
    setOnStopTyping,
    setOnReadReceipt,
    setOnMessageRecalled,
    setOnReactionUpdated,
    setOnFriendRequest,
    addToast,
  ]);

  // Tự động mở chat khi chuyển hướng từ URL (/chat?partnerId=...)
  const targetPartnerId = searchParams.get('partnerId');
  useEffect(() => {
    if (targetPartnerId) {
      handleStartChatWithUser(targetPartnerId);
      setSearchParams({}, { replace: true });
    }
  }, [targetPartnerId, conversations.length, handleStartChatWithUser, setSearchParams]);

  // Unfriend confirmation modal
  const handleUnfriend = (friendId) => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Hủy kết bạn?',
      message: 'Bạn có chắc chắn muốn hủy kết bạn với người này?',
      confirmText: 'Hủy kết bạn',
      cancelText: 'Hủy',
      confirmType: 'danger',
      onConfirm: async () => {
        const success = await executeUnfriend(friendId);
        if (success) {
          setShowProfileDrawer(false);
        }
      },
    });
  };

  const partner = extractPartner(activeConversation, user);

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
      {/* 1. Sidebar (Full width on mobile when no chat active) */}
      {(!isMobile || !activeConversation) && (
        <div style={{ width: isMobile ? '100%' : 'auto', height: '100%', display: 'flex' }}>
          <Sidebar
            conversations={conversations}
            activeConversation={activeConversation}
            onSelectConversation={(conv) => setActiveConversation(conv)}
            onOpenSearchModal={() => setShowSearchModal(true)}
            onOpenRequestsModal={() => setShowRequestsModal(true)}
            pendingRequestsCount={incomingRequests.length}
          />
        </div>
      )}

      {/* 2. Main Chat Area (Full width on mobile with back button) */}
      {(!isMobile || activeConversation) && (
        <ChatArea
          conversation={activeConversation}
          messages={messages}
          loadingMessages={loadingMessages}
          onSendMessage={handleSendMessage}
          onRetryMessage={handleRetryMessage}
          onRecallMessage={handleRecallMessage}
          onDeleteMessageForMe={handleDeleteMessageForMe}
          onReactMessage={handleReactMessage}
          onToggleProfile={() => setShowProfileDrawer(!showProfileDrawer)}
          onBack={isMobile ? () => setActiveConversation(null) : null}
          isTyping={typingPartnerId === (partner?._id || partner?.id)}
        />
      )}

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

      <ConfirmModal
        isOpen={confirmModalConfig.isOpen}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        confirmText={confirmModalConfig.confirmText}
        cancelText={confirmModalConfig.cancelText}
        confirmType={confirmModalConfig.confirmType}
        onConfirm={confirmModalConfig.onConfirm}
        onClose={() => setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default ChatPage;
