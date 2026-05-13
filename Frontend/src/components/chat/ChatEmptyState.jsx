import React from 'react';
import { Smile } from 'lucide-react';

export const ChatEmptyState = () => {
  return (
    <div className="chat-empty-state-wrapper">
      <div className="chat-empty-state-icon-box">
        <Smile size={36} />
      </div>
      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
        Chào mừng đến với <span className="gradient-text">Bondly</span>
      </h3>
      <p style={{ maxWidth: '420px', fontSize: '0.92rem', lineHeight: 1.6 }}>
        Chọn một cuộc trò chuyện từ thanh bên trái hoặc tìm kiếm bạn bè để bắt đầu trao đổi tin nhắn tức thì.
      </p>
    </div>
  );
};

export default ChatEmptyState;
