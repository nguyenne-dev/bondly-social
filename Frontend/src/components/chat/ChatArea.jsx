import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { UserPlus, Check, Ban } from 'lucide-react';
import { ImageViewerModal } from '../modals/ImageViewerModal';
import { ConfirmModal } from '../modals/ConfirmModal';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import ChatEmptyState from './ChatEmptyState';
import { extractPartner } from '../../utils/partner';

export const ChatArea = ({
  conversation,
  messages,
  loadingMessages,
  loadingMore,
  hasMore,
  onLoadMoreMessages,
  onSendMessage,
  onRetryMessage,
  onRecallMessage,
  onDeleteMessageForMe,
  onReactMessage,
  onToggleProfile,
  onBack,
  isTyping,
  isFriend,
  incomingRequestId,
  sentRequestId,
  onSendFriendRequest,
  onAcceptFriendRequest,
  onRejectFriendRequest,
  onCancelFriendRequest,
}) => {
  const { user } = useAuth();
  const { isUserOnline, sendTypingSocket, sendStopTypingSocket, markAsReadSocket } = useSocket();
  const [viewerImage, setViewerImage] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Confirm Modal state
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    cancelText: 'Hủy',
    confirmType: 'danger',
    onConfirm: () => {},
  });

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const prevScrollHeightRef = useRef(0);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const partner = extractPartner(conversation, user);
  const partnerId = partner?._id || partner?.id;
  const isOnline = isUserOnline(partnerId);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Guard chống gọi load-more trùng nhiều lần khi scroll liên tục
  const topLoadingRef = useRef(false);
  useEffect(() => {
    if (!loadingMore) topLoadingRef.current = false;
  }, [loadingMore]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setIsAtBottom(distanceToBottom <= 120);

    // Auto-load older messages when scrolled near the top
    if (hasMore && !loadingMore && !topLoadingRef.current && container.scrollTop <= 150) {
      topLoadingRef.current = true;
      onLoadMoreMessages(conversation?._id);
    }
  }, [hasMore, loadingMore, onLoadMoreMessages, conversation?._id]);

  // Auto-scroll to bottom when entering a new conversation or on message updates IF already near bottom
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom('smooth');
    }
  }, [messages, isTyping, isAtBottom, scrollToBottom]);

  // Open new conversation: always jump to the very bottom (reset position)
  const lastConvIdRef = useRef(null);
  useEffect(() => {
    if (conversation?._id && conversation._id !== lastConvIdRef.current) {
      lastConvIdRef.current = conversation._id;
      setIsAtBottom(true);
      // Dùng rAF để đảm bảo scroll sau khi danh sách đã render đủ tin mới
      requestAnimationFrame(() => {
        requestAnimationFrame(() => scrollToBottom('auto'));
      });
    }
  }, [conversation?._id, scrollToBottom, messages]);

  // Preserve scroll position when prepending older messages
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (loadingMore && container) {
      prevScrollHeightRef.current = container.scrollHeight;
    }
  }, [loadingMore]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!loadingMore && prevScrollHeightRef.current && container) {
      const heightDiff = container.scrollHeight - prevScrollHeightRef.current;
      container.scrollTop = heightDiff;
      prevScrollHeightRef.current = 0;
    }
  }, [loadingMore, messages]);

  const handleLoadMore = () => {
    onLoadMoreMessages(conversation?._id);
  };

  // Mark as read when entering conversation (chạy 1 lần mỗi tin mới nhất,
// tránh spam socket trên mỗi render do typing / state thay đổi)
  const latestMessageId = messages.length > 0 ? messages[messages.length - 1]._id : null;
  useEffect(() => {
    if (conversation?._id && partnerId) {
      markAsReadSocket(conversation._id);
    }
  }, [conversation?._id, latestMessageId]);

  if (!conversation) {
    return <ChatEmptyState />;
  }

  return (
    <div className="chat-container">
      {/* 1. Chat Header */}
      <ChatHeader
        partner={partner}
        isOnline={isOnline}
        isTyping={isTyping}
        onBack={onBack}
        onAvatarClick={(avt) => {
          setViewerImage(avt);
          setIsViewerOpen(true);
        }}
        onToggleProfile={onToggleProfile}
      />

      {/* 1b. Trạng thái kết bạn (ẩn khi đã là bạn) */}
      {!isFriend && partnerId && (
        <div className="chat-friend-status-bar">
          {incomingRequestId ? (
            <>
              <span className="chat-friend-status-dot" style={{ color: 'var(--primary)' }}>🟡</span>
              <span className="chat-friend-status-text">
                {partner?.fullName || partner?.username} đã gửi lời mời kết bạn
              </span>
              <button
                className="btn btn-primary chat-friend-status-btn"
                onClick={() => onAcceptFriendRequest?.(incomingRequestId)}
              >
                <Check size={13} /> Xác nhận
              </button>
              <button
                className="btn btn-secondary chat-friend-status-btn"
                onClick={() => onRejectFriendRequest?.(incomingRequestId)}
              >
                <Ban size={13} /> Từ chối
              </button>
            </>
          ) : sentRequestId ? (
            <>
              <span className="chat-friend-status-dot" style={{ color: '#f59e0b' }}>🕐</span>
              <span className="chat-friend-status-text">Đã gửi lời mời kết bạn</span>
              <button
                className="btn btn-secondary chat-friend-status-btn"
                onClick={() => onCancelFriendRequest?.(sentRequestId)}
              >
                <Ban size={13} /> Hủy lời mời
              </button>
            </>
          ) : (
            <>
              <UserPlus size={14} className="chat-friend-status-dot" style={{ color: 'var(--primary)' }} />
              <span className="chat-friend-status-text">
                Chưa kết bạn — gửi lời mời để trò chuyện lâu dài
              </span>
              <button
                className="btn btn-primary chat-friend-status-btn"
                onClick={() => onSendFriendRequest?.(partnerId)}
              >
                <UserPlus size={13} /> Kết bạn
              </button>
            </>
          )}
        </div>
      )}

      {/* 2. Messages List & Typing Indicator */}
      <MessageList
        messages={messages}
        loadingMessages={loadingMessages}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onLoadMoreMessages={handleLoadMore}
        user={user}
        partner={partner}
        partnerId={partnerId}
        conversationId={conversation?._id}
        isOnline={isOnline}
        isTyping={isTyping}
        messagesEndRef={messagesEndRef}
        scrollContainerRef={scrollContainerRef}
        handleScroll={handleScroll}
        isAtBottom={isAtBottom}
        onScrollToBottom={() => scrollToBottom('smooth')}
        onImageClick={(url) => {
          setViewerImage(url);
          setIsViewerOpen(true);
        }}
        onReactMessage={onReactMessage}
        onDeleteMessageForMe={onDeleteMessageForMe}
        onRecallMessage={onRecallMessage}
        onRetryMessage={onRetryMessage}
        setConfirmConfig={setConfirmConfig}
      />

      {/* 3. Input Area */}
      <ChatInput
        onSendMessage={onSendMessage}
        partnerId={partnerId}
        conversationId={conversation?._id}
        sendTypingSocket={sendTypingSocket}
        sendStopTypingSocket={sendStopTypingSocket}
      />

      {/* Fullscreen Image Viewer Modal */}
      <ImageViewerModal
        isOpen={isViewerOpen}
        imageUrl={viewerImage}
        altText="Ảnh chi tiết"
        onClose={() => setIsViewerOpen(false)}
      />

      {/* Confirmation Modal for Delete & Recall */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        cancelText={confirmConfig.cancelText}
        confirmType={confirmConfig.confirmType}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default ChatArea;
