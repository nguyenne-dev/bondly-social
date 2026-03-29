import React from 'react';
import { X, Mail, Phone, Calendar, UserX, Shield, Sparkles } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

export const ProfileDrawer = ({ isOpen, onClose, partner, onUnfriend }) => {
  const { isUserOnline } = useSocket();
  const partnerId = partner?._id || partner?.id;
  const isOnline = isUserOnline(partnerId);

  if (!isOpen || !partner) return null;

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
        {/* Avatar & Name */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '14px' }}>
            <img
              src={
                partner.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  partner.fullName || partner.username || 'User'
                )}&background=06b6d4&color=fff`
              }
              alt={partner.fullName}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '24px',
                objectFit: 'cover',
                border: '2px solid var(--primary)',
                boxShadow: 'var(--shadow-md)',
              }}
            />
            {isOnline && (
              <span
                className="online-dot"
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  width: '16px',
                  height: '16px',
                }}
              />
            )}
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{partner.fullName || partner.username}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            @{partner.username}
          </p>

          <div style={{ display: 'inline-flex', marginTop: '10px' }}>
            <span className={`badge ${isOnline ? 'badge-primary' : 'badge-secondary'}`}>
              {isOnline ? '🟢 Đang trực tuyến' : '⚪ Đang ngoại tuyến'}
            </span>
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

        {/* Action Button: Unfriend */}
        <button
          onClick={() => onUnfriend(partnerId)}
          className="btn btn-secondary"
          style={{ width: '100%', color: 'var(--danger)', borderColor: 'var(--danger-bg)' }}
        >
          <UserX size={16} /> Hủy kết bạn
        </button>
      </div>
    </div>
  );
};

export default ProfileDrawer;
