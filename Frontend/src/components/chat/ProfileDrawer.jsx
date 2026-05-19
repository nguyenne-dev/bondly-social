import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Phone, UserX, Shield, UserPlus, Check, Ban, ExternalLink } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { ImageViewerModal } from '../modals/ImageViewerModal';
import Avatar from '../common/Avatar';
import { getAvatarUrl } from '../../utils/avatar';

export const ProfileDrawer = ({
  isOpen,
  onClose,
  partner,
  onUnfriend,
  onSendFriendRequest,
  onAcceptFriendRequest,
  onRejectFriendRequest,
  onCancelFriendRequest,
  isFriend,
  incomingRequestId,
  sentRequestId,
}) => {
  const { isUserOnline } = useSocket();
  const navigate = useNavigate();
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [addCardDismissed, setAddCardDismissed] = useState(false);
  const partnerId = partner?._id || partner?.id;
  const isOnline = isUserOnline(partnerId);

  // Mỗi lần mở drawer lại, hiện lại card "Kết bạn" (nếu trước đó đã bấm X)
  useEffect(() => {
    if (isOpen) setAddCardDismissed(false);
  }, [isOpen]);

  if (!isOpen || !partner) return null;

  const partnerAvatar = getAvatarUrl(partner);

  return (
    <div
      className="animate-fade-in"
      style={{
        width: '320px',
        backgroundColor: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0,
        zIndex: 20,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Thông Tin Bạn Chat</h3>
        <button onClick={onClose} className="btn-icon" style={{ width: '32px', height: '32px' }}>
          <X size={16} />
        </button>
      </div>

      {/* Profile Body */}
      <div style={{ padding: '24px 20px', overflowY: 'auto', flex: 1 }}>
        {/* Avatar & Name + Action kết bạn / hủy kết bạn ngay dưới trạng thái */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Avatar
            user={partner}
            src={partnerAvatar}
            size={80}
            isOnline={isOnline}
            onClick={() => setIsViewerOpen(true)}
            title="Bấm để xem ảnh đại diện phóng to"
            style={{ marginBottom: '14px' }}
            imageStyle={{ border: '2px solid var(--primary)', boxShadow: 'var(--shadow-md)', transition: 'opacity 0.2s' }}
          />

          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{partner.fullName || partner.username}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            @{partner.username}
          </p>

          <div style={{ display: 'inline-flex', marginTop: '10px' }}>
            <span className={`badge ${isOnline ? 'badge-primary' : 'badge-secondary'}`}>
              {isOnline ? '🟢 Đang trực tuyến' : '⚪ Đang ngoại tuyến'}
            </span>
          </div>

          {/* Trạng thái quan hệ: bạn / có lời mời đến / đã gửi lời mời / chưa có */}
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {isFriend ? (
              <button
                onClick={() => onUnfriend(partnerId)}
                className="btn btn-secondary"
                style={{ width: '100%', color: 'var(--danger)', borderColor: 'var(--danger-bg)' }}
              >
                <UserX size={16} /> Hủy kết bạn
              </button>
            ) : incomingRequestId ? (
              <>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => onAcceptFriendRequest?.(incomingRequestId)}
                >
                  <UserPlus size={16} /> Xác nhận kết bạn
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                  onClick={() => onRejectFriendRequest?.(incomingRequestId)}
                >
                  <Ban size={16} /> Từ chối
                </button>
              </>
            ) : sentRequestId ? (
              <>
                <button className="btn btn-secondary" style={{ width: '100%' }} disabled>
                  <Check size={16} /> Đã gửi lời mời
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                  onClick={() => onCancelFriendRequest?.(sentRequestId)}
                >
                  <Ban size={16} /> Hủy lời mời
                </button>
              </>
            ) : (
              !addCardDismissed && (
                <div
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '8px',
                      marginBottom: '6px',
                    }}
                  >
                    <p style={{ fontWeight: 700, fontSize: '0.92rem', textAlign: 'left' }}>
                      Kết bạn với{' '}
                      <span style={{ color: 'var(--primary)' }}>
                        {partner.fullName || partner.username}
                      </span>
                    </p>
                    <button
                      onClick={() => setAddCardDismissed(true)}
                      className="btn-icon"
                      style={{ width: '24px', height: '24px', flexShrink: 0 }}
                      aria-label="Đóng gợi ý kết bạn"
                      title="Tắt gợi ý"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.5,
                      marginBottom: '12px',
                      textAlign: 'left',
                    }}
                  >
                    Gửi lời mời kết bạn để trò chuyện lâu dài cùng nhau nhé!
                  </p>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => onSendFriendRequest?.(partnerId)}
                  >
                    <UserPlus size={16} /> Kết bạn
                  </button>
                </div>
              )
            )}
          </div>
        </div>

        {/* Bio */}
        {partner.bio && (
          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-subtle)',
              marginBottom: '20px',
              fontSize: '0.88rem',
              color: 'var(--text-main)',
              lineHeight: 1.6,
            }}
          >
            <p>{partner.bio}</p>
          </div>
        )}

        {/* Details list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '30px' }}>
          {partner.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.88rem' }}>
              <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'var(--bg-subtle)', color: 'var(--primary)' }}>
                <Mail size={16} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Email</p>
                <p style={{ fontWeight: 500, textOverflow: 'ellipsis', overflow: 'hidden' }}>{partner.email}</p>
              </div>
            </div>
          )}

          {partner.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.88rem' }}>
              <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'var(--bg-subtle)', color: 'var(--primary)' }}>
                <Phone size={16} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Số điện thoại</p>
                <p style={{ fontWeight: 500 }}>{partner.phone}</p>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.88rem' }}>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'var(--bg-subtle)', color: 'var(--primary)' }}>
              <Shield size={16} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Bảo mật & Mã hóa</p>
              <p style={{ fontWeight: 500 }}>JWT End-to-End Handshake</p>
            </div>
          </div>
        </div>

        {/* Xem trang cá nhân đầy đủ */}
        <button
          onClick={() => {
            navigate(`/user/${partnerId}`);
            onClose();
          }}
          className="btn btn-secondary"
          style={{ width: '100%', marginBottom: '4px' }}
        >
          <ExternalLink size={16} /> Xem trang cá nhân
        </button>
      </div>

      <ImageViewerModal
        isOpen={isViewerOpen}
        imageUrl={partnerAvatar}
        altText={partner.fullName || partner.username}
        onClose={() => setIsViewerOpen(false)}
      />
    </div>
  );
};

export default ProfileDrawer;
