import React from 'react';
import { ChevronDown } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import Avatar from '../common/Avatar';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { dayKey, formatDayLabel } from '../../utils/date';

export const MessageList = ({
  messages = [],
  loadingMessages = false,
  loadingMore = false,
  hasMore = false,
  onLoadMoreMessages,
  user,
  partner,
  partnerId,
  conversationId,
  isOnline = false,
  isTyping = false,
  messagesEndRef,
  scrollContainerRef,
  handleScroll,
  isAtBottom = true,
  onScrollToBottom,
  onImageClick,
  onReactMessage,
  onDeleteMessageForMe,
  onRecallMessage,
  onRetryMessage,
  setConfirmConfig,
}) => {
  const currentUserId = (user?._id || user?.id)?.toString();

  const getSenderId = (msg) =>
    (
      msg.senderId?._id ||
      msg.senderId?.id ||
      msg.senderId ||
      msg.sender?._id ||
      msg.sender?.id ||
      msg.sender
    )?.toString();

  const isMe = (msg) => {
    const msgSenderId = getSenderId(msg);
    return (
      msg.status === 'sending' ||
      msg.status === 'failed' ||
      Boolean(currentUserId && msgSenderId && currentUserId === msgSenderId)
    );
  };

  // Build a grouped + date-separated list
  const renderItems = [];
  let prevKey = null;
  let prevIsMe = null;
  let prevTime = null;

  messages.forEach((msg, index) => {
    const key = dayKey(msg.createdAt);
    const senderId = getSenderId(msg);
    const msgIsMe = isMe(msg);

    // Date separator between different days
    if (key && key !== prevKey) {
      renderItems.push(
        <div className="chat-date-separator" key={`date-${key}`}>
          <span>{formatDayLabel(msg.createdAt)}</span>
        </div>
      );
      prevKey = key;
      prevIsMe = null;
      prevTime = null;
    }

    // Time-group separator (messages from same sender within 10 min, same day)
    const sameSender = prevIsMe === msgIsMe && prevIsMe !== null;
    let group = null;
    if (sameSender && prevTime) {
      const gapMinutes =
        (new Date(msg.createdAt).getTime() - new Date(prevTime).getTime()) / 60000;
      group = gapMinutes < 10;
    }

    renderItems.push(
      <MessageBubble
        key={msg._id || `${index}-${senderId}`}
        msg={msg}
        isMe={msgIsMe}
        grouped={Boolean(group)}
        onImageClick={onImageClick}
        onReactMessage={(emoji) =>
          onReactMessage &&
          onReactMessage({
            messageId: msg._id,
            receiverId: partnerId,
            emoji,
            conversationId,
          })
        }
        onDeleteForMe={() =>
          setConfirmConfig &&
          setConfirmConfig({
            isOpen: true,
            title: 'Xóa tin nhắn ở phía bạn?',
            message:
              'Tin nhắn này sẽ được ẩn ở màn hình của bạn. Người nhận vẫn xem được và bản ghi vẫn được lưu trữ an toàn.',
            confirmText: 'Xóa một bên',
            confirmType: 'danger',
            onConfirm: () =>
              onDeleteMessageForMe && onDeleteMessageForMe(msg._id),
          })
        }
        onRecallMessage={() =>
          setConfirmConfig &&
          setConfirmConfig({
            isOpen: true,
            title: 'Thu hồi tin nhắn với mọi người?',
            message:
              'Tin nhắn sẽ được đánh dấu đã thu hồi (xóa toàn bộ) với tất cả thành viên trong cuộc trò chuyện.',
            confirmText: 'Thu hồi tất cả',
            confirmType: 'danger',
            onConfirm: () =>
              onRecallMessage &&
              onRecallMessage({
                messageId: msg._id,
                receiverId: partnerId,
                conversationId,
              }),
          })
        }
        onRetryMessage={onRetryMessage}
      />
    );

    prevIsMe = msgIsMe;
    prevTime = prevTime === null ? msg.createdAt : (group ? prevTime : msg.createdAt);
  });

  return (
    <>
      {/* Messages Scroll Container */}
      <div
        className="message-list-container"
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        {loadingMessages ? (
          <LoadingSpinner message="Đang tải lịch sử trò chuyện..." />
        ) : messages.length === 0 ? (
          <div
            className="animate-fade-in"
            style={{
              textAlign: 'center',
              margin: 'auto',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '30px',
            }}
          >
            <Avatar
              user={partner}
              size={80}
              isOnline={isOnline}
              style={{ marginBottom: '16px' }}
              imageStyle={{ boxShadow: '0 8px 24px rgba(6, 182, 212, 0.2)' }}
            />

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
              {partner?.fullName || partner?.username}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '360px', marginBottom: '16px' }}>
              {partner?.bio || 'Chưa có lời giới thiệu cá nhân'}
            </p>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                fontSize: '0.85rem',
                color: 'var(--primary)',
                fontWeight: 600,
              }}
            >
              <span>👋 Hãy gửi tin nhắn đầu tiên để bắt đầu trò chuyện!</span>
            </div>
          </div>
        ) : (
          <>
            {/* Auto-load older messages: loading indicator at top */}
            {loadingMore && (
              <div className="chat-load-more-wrap">
                <LoadingSpinner message="" size={18} />
              </div>
            )}

            {/* End-of-history contact info header (like Facebook/Messenger) */}
            {!hasMore && !loadingMore && (
              <div className="chat-contact-header">
                <Avatar
                  user={partner}
                  size={64}
                  isOnline={isOnline}
                  imageStyle={{ boxShadow: '0 8px 24px rgba(6, 182, 212, 0.25)' }}
                />
                <h3>{partner?.fullName || partner?.username}</h3>
                <p className="chat-contact-sub">
                  {partner?.bio || 'Bạn đang trò chuyện với người này'}
                </p>
                <span className="chat-contact-badge">
                  Đây là bắt đầu lịch sử trò chuyện
                </span>
              </div>
            )}

            {renderItems}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll-to-bottom FAB when user scrolled up */}
      {!isAtBottom && (
        <button
          className="chat-scroll-bottom-fab"
          onClick={onScrollToBottom}
          aria-label="Trở về tin mới nhất"
          title="Trở về tin mới nhất"
        >
          <ChevronDown size={20} />
        </button>
      )}

      {/* Typing Indicator Banner */}
      {isTyping && <TypingIndicator partnerName={partner?.fullName || partner?.username} />}
    </>
  );
};

export default MessageList;
