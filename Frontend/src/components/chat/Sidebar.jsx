import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Search, 
  UserPlus, 
  Users, 
  LogOut, 
  Moon, 
  Sun, 
  MessageSquare,
  Sparkles,
  Settings,
  MoreVertical
} from 'lucide-react';

export const Sidebar = ({
  conversations,
  activeConversation,
  onSelectConversation,
  onOpenSearchModal,
  onOpenRequestsModal,
  pendingRequestsCount,
}) => {
  const { user, logout } = useAuth();
  const { isUserOnline } = useSocket();
  const { isDark, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  // Lọc cuộc hội thoại theo tên bạn chat
  const filteredConversations = conversations.filter((conv) => {
    const partner = conv.participants?.find((p) => (p._id || p.id) !== (user?._id || user?.id));
    const partnerName = partner?.fullName || partner?.username || '';
    return partnerName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div
      style={{
        width: '340px',
        minWidth: '280px',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0,
      }}
    >
      {/* 1. Brand & Current User Header */}
      <div
        style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(6, 182, 212, 0.4)',
            }}
          >
            <Sparkles size={20} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Nex<span className="gradient-text">Chat</span>
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span className="online-dot"></span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {user?.fullName || user?.username}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={toggleTheme}
            className="btn-icon"
            style={{ width: '32px', height: '32px' }}
            title="Đổi giao diện Sáng / Tối"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            onClick={onOpenRequestsModal}
            className="btn-icon"
            style={{ width: '32px', height: '32px', position: 'relative' }}
            title="Lời mời kết bạn"
          >
            <Users size={16} />
            {pendingRequestsCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ef4444',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {pendingRequestsCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenSearchModal}
            className="btn-icon"
            style={{ width: '32px', height: '32px' }}
            title="Tìm kiếm bạn bè mới"
          >
            <UserPlus size={16} />
          </button>

          <button
            onClick={logout}
            className="btn-icon"
            style={{ width: '32px', height: '32px', color: 'var(--danger)' }}
            title="Đăng xuất"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* 2. Search Box */}
      <div style={{ padding: '14px 16px 8px' }}>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '14px',
              color: 'var(--text-subtle)',
            }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '38px', height: '38px', fontSize: '0.85rem' }}
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 3. Conversations List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {filteredConversations.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 16px',
              color: 'var(--text-muted)',
            }}
          >
            <MessageSquare size={36} color="var(--text-subtle)" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Chưa có cuộc trò chuyện</p>
            <p style={{ fontSize: '0.8rem', marginTop: '4px', color: 'var(--text-subtle)' }}>
              Hãy bấm vào icon thêm bạn để bắt đầu trò chuyện ngay nhé!
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const partner = conv.participants?.find(
              (p) => (p._id || p.id) !== (user?._id || user?.id)
            );
            const partnerId = partner?._id || partner?.id;
            const isOnline = isUserOnline(partnerId);
            const isActive = activeConversation?._id === conv._id;

            // Unread Count
            const unreadCount =
              conv.unreadCounts instanceof Map
                ? conv.unreadCounts.get(user?._id || user?.id) || 0
                : conv.unreadCounts?.[user?._id || user?.id] || 0;

            // Last message format
            const lastMsg = conv.lastMessage;
            const isRecalled = lastMsg?.isRecalled;
            const lastMsgText = isRecalled
              ? 'Tin nhắn đã thu hồi'
              : lastMsg?.text || (lastMsg?.media?.url ? '📷 [Hình ảnh]' : 'Bắt đầu cuộc trò chuyện');

            const isMyMessage =
              lastMsg?.senderId?._id === (user?._id || user?.id) ||
              lastMsg?.senderId === (user?._id || user?.id);

            return (
              <div
                key={conv._id}
                onClick={() => onSelectConversation(conv)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isActive ? 'var(--bg-subtle)' : 'transparent',
                  border: isActive ? '1px solid var(--border-focus)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {/* Avatar with Online badge */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={
                      partner?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        partner?.fullName || partner?.username || 'User'
                      )}&background=06b6d4&color=fff`
                    }
                    alt={partner?.fullName}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '14px',
                      objectFit: 'cover',
                      border: '1px solid var(--border)',
                    }}
                  />
                  {isOnline && (
                    <span
                      className="online-dot"
                      style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                      }}
                    />
                  )}
                </div>

                {/* Info preview */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '3px',
                    }}
                  >
                    <h4
                      style={{
                        fontSize: '0.92rem',
                        fontWeight: unreadCount > 0 ? 800 : 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: 'var(--text-main)',
                      }}
                    >
                      {partner?.fullName || partner?.username}
                    </h4>

                    <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                      {conv.updatedAt
                        ? new Date(conv.updatedAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: unreadCount > 0 ? 'var(--text-main)' : 'var(--text-muted)',
                        fontWeight: unreadCount > 0 ? 600 : 400,
                        fontStyle: isRecalled ? 'italic' : 'normal',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '180px',
                      }}
                    >
                      {isMyMessage && !isRecalled ? 'Bạn: ' : ''}
                      {lastMsgText}
                    </p>

                    {unreadCount > 0 && <span className="badge-unread">{unreadCount}</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;
