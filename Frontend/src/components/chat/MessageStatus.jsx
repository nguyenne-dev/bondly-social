import React from 'react';
import { Loader2, AlertCircle, RefreshCw, CheckCheck, Check } from 'lucide-react';

export const MessageStatus = ({ status, isRead, onRetry }) => {
  if (status === 'sending') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px',
          color: 'var(--text-subtle)',
          opacity: 0.8,
        }}
        title="Đang gửi tin nhắn..."
      >
        <Loader2 size={12} className="animate-spin" />
        <span style={{ fontSize: '0.68rem' }}>Đang gửi</span>
      </span>
    );
  }

  if (status === 'failed') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          color: '#ef4444',
          fontWeight: 600,
        }}
        title="Gửi thất bại. Bấm để thử lại!"
      >
        <AlertCircle size={12} />
        <span style={{ fontSize: '0.68rem' }}>Lỗi</span>
        {onRetry && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRetry();
            }}
            className="btn-icon"
            style={{
              width: '18px',
              height: '18px',
              padding: 0,
              color: '#ef4444',
              background: 'rgba(239, 68, 68, 0.12)',
              borderRadius: '4px',
            }}
            title="Thử lại"
          >
            <RefreshCw size={10} />
          </button>
        )}
      </span>
    );
  }

  if (isRead || status === 'read') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px',
          color: 'var(--primary)',
        }}
        title="Đã xem"
      >
        <CheckCheck size={14} color="var(--primary)" />
        <span style={{ fontSize: '0.68rem', fontWeight: 600 }}>Đã xem</span>
      </span>
    );
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        color: 'var(--text-subtle)',
      }}
      title="Đã gửi thành công"
    >
      <Check size={14} />
      <span style={{ fontSize: '0.68rem' }}>Đã gửi</span>
    </span>
  );
};

export default MessageStatus;
