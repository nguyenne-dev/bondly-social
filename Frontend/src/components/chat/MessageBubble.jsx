import React, { useState } from 'react';
import MessageStatus from './MessageStatus';
import MessageActions from './MessageActions';
import { formatTime } from '../../utils/date';

export const MessageBubble = ({
  msg,
  isMe,
  onImageClick,
  onReactMessage,
  onDeleteForMe,
  onRecallMessage,
  onRetryMessage,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isRecalled = msg.isRecalled;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isMe ? 'flex-end' : 'flex-start',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexDirection: isMe ? 'row-reverse' : 'row',
          maxWidth: '75%',
        }}
      >
        {/* Message Bubble */}
        <div
          style={{
            padding: msg.media?.url ? '8px' : '12px 18px',
            borderRadius: isMe
              ? '18px 18px 4px 18px'
              : '18px 18px 18px 4px',
            background: isRecalled
              ? 'var(--bg-subtle)'
              : isMe
              ? 'var(--msg-sent-bg)'
              : 'var(--msg-received-bg)',
            color: isRecalled
              ? 'var(--text-subtle)'
              : isMe
              ? 'var(--msg-sent-color)'
              : 'var(--msg-received-color)',
            boxShadow: isMe ? '0 4px 14px rgba(6, 182, 212, 0.3)' : 'var(--shadow-sm)',
            fontSize: '0.925rem',
            lineHeight: 1.5,
            wordBreak: 'break-word',
            position: 'relative',
          }}
        >
          {isRecalled ? (
            <span style={{ fontStyle: 'italic', opacity: 0.8 }}>
              Tin nhắn đã được thu hồi
            </span>
          ) : (
            <>
              {msg.media?.url && (
                <img
                  src={msg.media.url}
                  alt="Attachment"
                  onClick={() => onImageClick && onImageClick(msg.media.url)}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '320px',
                    borderRadius: '12px',
                    display: 'block',
                    marginBottom: msg.text ? '8px' : '0',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s ease',
                  }}
                  title="Bấm để xem ảnh phóng to toàn màn hình"
                />
              )}
              {msg.text && <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>}
            </>
          )}

          {/* Reactions Floating Badge */}
          {msg.reactions && msg.reactions.length > 0 && !isRecalled && (
            <div
              style={{
                position: 'absolute',
                bottom: '-10px',
                right: isMe ? '8px' : 'auto',
                left: isMe ? 'auto' : '8px',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: '12px',
                padding: '2px 6px',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                fontSize: '0.75rem',
              }}
            >
              {Array.from(new Set(msg.reactions.map((r) => r.emoji))).map((emoji, idx) => (
                <span key={idx}>{emoji}</span>
              ))}
              {msg.reactions.length > 1 && (
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {msg.reactions.length}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Hover Quick Action Buttons */}
        {isHovered && !isRecalled && (
          <MessageActions
            isMe={isMe}
            onReact={onReactMessage}
            onDeleteForMe={onDeleteForMe}
            onRecall={onRecallMessage}
          />
        )}
      </div>

      {/* Timestamp & Read Status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.72rem',
          color: 'var(--text-subtle)',
          marginTop: '4px',
        }}
      >
        <span>{formatTime(msg.createdAt)}</span>
        {isMe && !isRecalled && (
          <MessageStatus
            status={msg.status}
            isRead={msg.isRead}
            onRetry={onRetryMessage ? () => onRetryMessage(msg) : undefined}
          />
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
