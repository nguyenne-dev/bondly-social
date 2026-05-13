import React from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import Avatar from '../common/Avatar';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

export const MessageList = ({
  messages = [],
  loadingMessages = false,
  user,
  partner,
  partnerId,
  conversationId,
  isOnline = false,
  isTyping = false,
  messagesEndRef,
  onImageClick,
  onReactMessage,
  onDeleteMessageForMe,
  onRecallMessage,
  onRetryMessage,
  setConfirmConfig,
}) => {
  const currentUserId = (user?._id || user?.id)?.toString();

  return (
    <>
      {/* Messages Scroll Container */}
      <div className="message-list-container">
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
          messages.map((msg) => {
            const msgSenderId = (
              msg.senderId?._id ||
              msg.senderId?.id ||
              msg.senderId ||
              msg.sender?._id ||
              msg.sender?.id ||
              msg.sender
            )?.toString();

            const isMe =
              msg.status === 'sending' ||
              msg.status === 'failed' ||
              Boolean(currentUserId && msgSenderId && currentUserId === msgSenderId);

            return (
              <MessageBubble
                key={msg._id}
                msg={msg}
                isMe={isMe}
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
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator Banner */}
      {isTyping && <TypingIndicator partnerName={partner?.fullName || partner?.username} />}
    </>
  );
};

export default MessageList;
