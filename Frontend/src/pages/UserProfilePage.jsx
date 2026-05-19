import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, UserPlus, Check, UserX, MessageSquare, Loader2, Users, Calendar, ShieldCheck, Ban } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { ImageViewerModal } from '../components/modals/ImageViewerModal';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../components/common/Toast';
import { useFriends } from '../hooks/useFriends';
import { useMobile } from '../hooks/useMobile';
import { userApi } from '../api/user.api';
import Avatar from '../components/common/Avatar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getAvatarUrl } from '../utils/avatar';

export const UserProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { isUserOnline } = useSocket();
  const isMobile = useMobile(768);

  const {
    friendsList,
    incomingRequests,
    sentRequests,
    fetchFriendRequests,
    handleSendFriendRequest,
    handleAcceptRequest,
    handleRejectRequest,
    handleCancelRequest,
    executeUnfriend,
  } = useFriends();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewerImage, setViewerImage] = useState(false);

  const currentUserId = user?._id || user?.id;
  const isOwnProfile = id === currentUserId;

  // Lấy public profile theo id
  const loadProfile = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await userApi.getUserById(id);
      setProfile(res?.data || null);
    } catch (err) {
      addToast('Không tìm thấy người dùng này', 'error');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [id, addToast]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Khi id đổi, làm mới luôn trạng thái quan hệ
  useEffect(() => {
    fetchFriendRequests();
  }, [id, fetchFriendRequests]);

  const isFriend =
    profile && !isOwnProfile
      ? friendsList.some((f) => (f._id || f.id) === profile._id)
      : false;
  const incomingRequest =
    profile && !isOwnProfile
      ? incomingRequests.find((r) => (r.senderId?._id || r.senderId) === profile._id) || null
      : null;
  const sentRequest =
    profile && !isOwnProfile
      ? sentRequests.find((r) => (r.receiverId?._id || r.receiverId) === profile._id) || null
      : null;

  const partnerId = profile?._id;
  const isOnline = isUserOnline(partnerId);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner message="Đang tải thông tin..." />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)' }}>
      <Navbar />

      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          padding: isMobile ? '24px 16px' : '40px 24px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '560px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px 24px',
            alignSelf: 'flex-start',
          }}
        >
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="btn-icon"
            style={{ width: '36px', height: '36px', marginBottom: '16px' }}
            title="Quay lại"
            aria-label="Quay lại"
          >
            <ArrowLeft size={18} />
          </button>

          {!profile ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <p>Không tìm thấy người dùng này.</p>
              <Link to="/chat" style={{ color: 'var(--primary)', fontWeight: 600, marginTop: '12px', display: 'inline-block' }}>
                Quay lại Chat
              </Link>
            </div>
          ) : (
            <>
              {/* Avatar & Name + Action */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Avatar
                  user={profile}
                  src={getAvatarUrl(profile)}
                  size={96}
                  isOnline={isOnline && !isOwnProfile}
                  onClick={() => setViewerImage(true)}
                  title="Bấm để xem ảnh đại diện phóng to"
                  style={{ marginBottom: '14px' }}
                  imageStyle={{ border: '2px solid var(--primary)', boxShadow: 'var(--shadow-md)', transition: 'opacity 0.2s' }}
                />

                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                  {profile.fullName || profile.username}
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  @{profile.username}
                </p>

                <div style={{ display: 'inline-flex', marginTop: '10px' }}>
                  {isOwnProfile ? (
                    <span className="badge badge-secondary">Đây là bạn</span>
                  ) : (
                    <span className={`badge ${isOnline ? 'badge-primary' : 'badge-secondary'}`}>
                      {isOnline ? '🟢 Đang trực tuyến' : '⚪ Đang ngoại tuyến'}
                    </span>
                  )}
                </div>

                {/* Action: Kết bạn / Xác nhận / Hủy lời mời / Hủy kết bạn */}
                <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {!isOwnProfile && isFriend && (
                    <button
                      onClick={async () => {
                        const ok = await executeUnfriend(profile._id);
                        if (ok) loadProfile();
                      }}
                      className="btn btn-secondary"
                      style={{ width: '100%', color: 'var(--danger)', borderColor: 'var(--danger-bg)' }}
                    >
                      <UserX size={16} /> Hủy kết bạn
                    </button>
                  )}

                  {!isOwnProfile && !isFriend && incomingRequest && (
                    <>
                      <button
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        onClick={async () => {
                          await handleAcceptRequest(incomingRequest._id);
                          loadProfile();
                        }}
                      >
                        <UserPlus size={16} /> Xác nhận kết bạn
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ width: '100%' }}
                        onClick={async () => {
                          await handleRejectRequest(incomingRequest._id);
                          loadProfile();
                        }}
                      >
                        <Ban size={16} /> Từ chối
                      </button>
                    </>
                  )}

                  {!isOwnProfile && !isFriend && !incomingRequest && sentRequest && (
                    <>
                      <button className="btn btn-secondary" style={{ width: '100%' }} disabled>
                        <Check size={16} /> Đã gửi lời mời
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ width: '100%' }}
                        onClick={async () => {
                          await handleCancelRequest(sentRequest._id);
                          loadProfile();
                        }}
                      >
                        <Ban size={16} /> Hủy lời mời
                      </button>
                    </>
                  )}

                  {!isOwnProfile && !isFriend && !incomingRequest && !sentRequest && (
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                      onClick={async () => {
                        const ok = await handleSendFriendRequest(profile._id);
                        if (ok) loadProfile();
                      }}
                    >
                      <UserPlus size={16} /> Kết bạn
                    </button>
                  )}

                  {!isOwnProfile && (
                    <button
                      className="btn btn-secondary"
                      style={{ width: '100%' }}
                      onClick={() => navigate(`/chat?partnerId=${profile._id}`)}
                    >
                      <MessageSquare size={16} /> Nhắn tin
                    </button>
                  )}

                  {isOwnProfile && (
                    <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => navigate('/settings')}>
                      <Users size={16} /> Chỉnh sửa trang cá nhân
                    </button>
                  )}
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-subtle)',
                    marginBottom: '20px',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                  }}
                >
                  <p>{profile.bio}</p>
                </div>
              )}

              {/* Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {profile.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem' }}>
                    <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'var(--bg-subtle)', color: 'var(--primary)' }}>
                      <Mail size={16} />
                    </div>
                    <p style={{ fontWeight: 500 }}>{profile.email}</p>
                  </div>
                )}

                {profile.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem' }}>
                    <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'var(--bg-subtle)', color: 'var(--primary)' }}>
                      <Phone size={16} />
                    </div>
                    <p style={{ fontWeight: 500 }}>{profile.phone}</p>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem' }}>
                  <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'var(--bg-subtle)', color: 'var(--primary)' }}>
                    <Users size={16} />
                  </div>
                  <p style={{ fontWeight: 500 }}>
                    {profile.friendsCount || 0} bạn bè
                  </p>
                </div>

                {profile.createdAt && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem' }}>
                    <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'var(--bg-subtle)', color: 'var(--primary)' }}>
                      <Calendar size={16} />
                    </div>
                    <p style={{ fontWeight: 500 }}>
                      Tham gia {new Date(profile.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' })}
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem' }}>
                  <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'var(--bg-subtle)', color: 'var(--primary)' }}>
                    <ShieldCheck size={16} />
                  </div>
                  <p style={{ fontWeight: 500 }}>JWT End-to-End Handshake</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />

      <ImageViewerModal
        isOpen={viewerImage}
        imageUrl={profile ? getAvatarUrl(profile) : ''}
        altText={profile?.fullName || profile?.username}
        onClose={() => setViewerImage(false)}
      />
    </div>
  );
};

export default UserProfilePage;