import React, { useState } from 'react';
import Modal from '../common/Modal';
import { UserCheck, UserX, Clock, Check, X } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

export const FriendRequestsModal = ({
  isOpen,
  onClose,
  incomingRequests,
  sentRequests,
  loading,
  onAccept,
  onReject,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState('INCOMING'); // 'INCOMING' | 'SENT'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quản Lý Lời Mời Kết Bạn" maxWidth="520px">
      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          backgroundColor: 'var(--bg-subtle)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px',
        }}
      >
        <button
          onClick={() => setActiveTab('INCOMING')}
          className={`btn btn-sm ${activeTab === 'INCOMING' ? 'btn-primary' : ''}`}
          style={{
            flex: 1,
            backgroundColor: activeTab === 'INCOMING' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'INCOMING' ? '#fff' : 'var(--text-muted)',
            padding: '8px',
            fontSize: '0.85rem',
          }}
        >
          Lời mời đã nhận ({incomingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('SENT')}
          className={`btn btn-sm ${activeTab === 'SENT' ? 'btn-primary' : ''}`}
          style={{
            flex: 1,
            backgroundColor: activeTab === 'SENT' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'SENT' ? '#fff' : 'var(--text-muted)',
            padding: '8px',
            fontSize: '0.85rem',
          }}
        >
          Đã gửi ({sentRequests.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner message="Đang tải danh sách lời mời..." />
      ) : activeTab === 'INCOMING' ? (
        incomingRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
            <UserCheck size={36} color="var(--text-subtle)" style={{ marginBottom: '10px' }} />
            <p style={{ fontSize: '0.9rem' }}>Không có lời mời kết bạn nào đang chờ duyệt</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {incomingRequests.map((req) => {
              const sender = req.senderId;
              return (
                <div
                  key={req._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={
                        sender?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          sender?.fullName || 'User'
                        )}&background=06b6d4&color=fff`
                      }
                      alt={sender?.fullName}
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        objectFit: 'cover',
                      }}
                    />
                    <div>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 700 }}>{sender?.fullName}</h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        @{sender?.username || sender?.email}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => onAccept(req._id)}
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      <Check size={14} /> Chấp nhận
                    </button>
                    <button
                      onClick={() => onReject(req._id)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        sentRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
            <Clock size={36} color="var(--text-subtle)" style={{ marginBottom: '10px' }} />
            <p style={{ fontSize: '0.9rem' }}>Bạn chưa gửi lời mời kết bạn nào</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sentRequests.map((req) => {
              const receiver = req.receiverId;
              return (
                <div
                  key={req._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={
                        receiver?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          receiver?.fullName || 'User'
                        )}&background=06b6d4&color=fff`
                      }
                      alt={receiver?.fullName}
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        objectFit: 'cover',
                      }}
                    />
                    <div>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 700 }}>{receiver?.fullName}</h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Đang chờ phản hồi...
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onCancel(req._id)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem', color: 'var(--danger)' }}
                  >
                    Hủy yêu cầu
                  </button>
                </div>
              );
            })}
          </div>
        )
      )}
    </Modal>
  );
};

export default FriendRequestsModal;
