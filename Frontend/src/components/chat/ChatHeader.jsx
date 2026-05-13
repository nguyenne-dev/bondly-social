import React from 'react';
import { ArrowLeft, Info } from 'lucide-react';
import Avatar from '../common/Avatar';
import { getAvatarUrl } from '../../utils/avatar';

export const ChatHeader = ({
  partner,
  isOnline = false,
  isTyping = false,
  onBack,
  onAvatarClick,
  onToggleProfile,
}) => {
  return (
    <div className="chat-header-bar">
      <div className="chat-header-info">
        {onBack && (
          <button
            onClick={onBack}
            className="btn-icon mobile-back-btn"
            style={{ width: '38px', height: '38px', borderRadius: '12px', flexShrink: 0 }}
            title="Quay lại danh sách hội thoại"
            aria-label="Quay lại danh sách hội thoại"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        <Avatar
          user={partner}
          size={44}
          isOnline={isOnline}
          onClick={() => {
            if (onAvatarClick) {
              onAvatarClick(getAvatarUrl(partner));
            }
          }}
          title="Bấm để xem ảnh đại diện phóng to"
        />

        <div>
          <h3 className="chat-header-title">
            {partner?.fullName || partner?.username}
          </h3>
          <p
            style={{
              fontSize: '0.8rem',
              color: isTyping
                ? 'var(--primary)'
                : isOnline
                ? 'var(--online)'
                : 'var(--text-subtle)',
              fontWeight: 600,
            }}
          >
            {isTyping ? 'Đang soạn tin nhắn...' : isOnline ? 'Đang hoạt động' : 'Offline'}
          </p>
        </div>
      </div>

      {/* Action icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={onToggleProfile}
          className="btn-icon"
          style={{ width: '36px', height: '36px' }}
          title="Thông tin chi tiết"
          aria-label="Xem thông tin chi tiết người dùng"
        >
          <Info size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
