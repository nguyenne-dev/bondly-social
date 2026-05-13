import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { ImageViewerModal } from '../components/modals/ImageViewerModal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/common/Toast';
import { userApi } from '../api/user.api';
import { uploadApi } from '../api/upload.api';
import { getAvatarUrl } from '../utils/avatar';
import { AVATAR_PRESETS } from '../utils/constants';
import { 
  User, 
  Lock, 
  Bell, 
  Palette, 
  LogOut, 
  Save, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck,
  Moon,
  Sun,
  Volume2,
  VolumeX
} from 'lucide-react';

export const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [viewerImage, setViewerImage] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Profile form
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    phone: user?.phone || '',
    gender: user?.gender || 'other',
  });

  // Password form
  const [passData, setPassData] = useState({
    newPass: '',
    confirmPass: '',
  });

  // Sound toggle
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('bondly_sound');
    return saved !== 'disabled';
  });

  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    localStorage.setItem('bondly_sound', nextState ? 'enabled' : 'disabled');
    addToast(nextState ? 'Đã bật âm thanh thông báo' : 'Đã tắt âm thanh thông báo', 'info');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await userApi.updateProfile(profileData);
      if (res?.data) {
        updateUser(res.data);
      } else {
        updateUser(profileData);
      }
      addToast('Cập nhật thông tin hồ sơ thành công!', 'success');
    } catch (err) {
      addToast(err.message || 'Lỗi khi cập nhật thông tin', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.newPass.length < 6) {
      addToast('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
      return;
    }
    if (passData.newPass !== passData.confirmPass) {
      addToast('Xác nhận mật khẩu không khớp', 'error');
      return;
    }

    try {
      setLoading(true);
      await userApi.changePassword({ newPass: passData.newPass });
      addToast('Đổi mật khẩu thành công!', 'success');
      setPassData({ newPass: '', confirmPass: '' });
    } catch (err) {
      addToast(err.message || 'Lỗi khi đổi mật khẩu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      logout();
      addToast('Đã đăng xuất tài khoản', 'info');
      navigate('/login');
    }
  };

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Avatar upload handler directly to Cloudinary (Lưu trữ ảnh đám mây)
  const handleAvatarFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      addToast('Đang tải ảnh lên máy chủ Cloudinary...', 'info');

      const res = await uploadApi.uploadAvatar(file);
      if (res?.data?.avatarUrl) {
        setProfileData((prev) => ({ ...prev, avatar: res.data.avatarUrl }));
        if (res.data.user) {
          updateUser(res.data.user);
        }
        addToast('Tải ảnh đại diện lên Cloudinary thành công!', 'success');
      }
    } catch (err) {
      console.error('Lỗi khi tải ảnh lên Cloudinary:', err);
      addToast(err.message || 'Lỗi khi tải ảnh lên đám mây', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 24px', flex: 1, width: '100%' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '24px' }}>Cài Đặt Tài Khoản</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '30px' }} className="settings-layout">
          {/* Sidebar Tabs */}
          <div className="glass-card" style={{ padding: '16px', height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              onClick={() => setActiveTab('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: activeTab === 'profile' ? 'var(--primary-light)' : 'transparent',
                color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeTab === 'profile' ? 700 : 500,
                fontSize: '0.92rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <User size={18} />
              <span>Hồ Sơ Cá Nhân</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: activeTab === 'security' ? 'var(--primary-light)' : 'transparent',
                color: activeTab === 'security' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeTab === 'security' ? 700 : 500,
                fontSize: '0.92rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <Lock size={18} />
              <span>Bảo Mật & Mật Khẩu</span>
            </button>

            <button
              onClick={() => setActiveTab('preferences')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: activeTab === 'preferences' ? 'var(--primary-light)' : 'transparent',
                color: activeTab === 'preferences' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeTab === 'preferences' ? 700 : 500,
                fontSize: '0.92rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <Palette size={18} />
              <span>Giao Diện & Âm Thanh</span>
            </button>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '10px 0' }} />

            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--danger)',
                fontWeight: 600,
                fontSize: '0.92rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <LogOut size={18} />
              <span>Đăng Xuất</span>
            </button>
          </div>

          {/* Main Tab Content */}
          <div className="glass-card" style={{ padding: '32px' }}>
            {activeTab === 'profile' && (
              <form onSubmit={handleUpdateProfile}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '20px' }}>Hồ Sơ Cá Nhân</h3>

                {/* Avatar Preview & Upload Area */}
                <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: 'var(--bg-subtle)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '14px' }}>
                    Ảnh đại diện
                  </label>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '22px', flexWrap: 'wrap' }}>
                    {/* Clickable Avatar with Camera Overlay & Fullscreen Preview */}
                    <div style={{ position: 'relative' }}>
                      <input
                        type="file"
                        id="avatar-file-input"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleAvatarFileSelect}
                        disabled={uploadingAvatar}
                      />
                      <div
                        onClick={() => {
                          const currentAvt = getAvatarUrl({ ...profileData, username: user?.username });
                          setViewerImage(currentAvt);
                          setIsViewerOpen(true);
                        }}
                        style={{ cursor: 'pointer', display: 'block', position: 'relative' }}
                        title="Bấm để xem ảnh phóng to toàn màn hình"
                      >
                        <img
                          src={getAvatarUrl({ ...profileData, username: user?.username })}
                          alt="Avatar"
                          style={{
                            width: '84px',
                            height: '84px',
                            borderRadius: '24px',
                            objectFit: 'cover',
                            border: '2px solid var(--primary)',
                            boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)',
                            display: 'block',
                            opacity: uploadingAvatar ? 0.5 : 1,
                            transition: 'opacity 0.2s ease',
                          }}
                        />
                      </div>

                      <label
                        htmlFor="avatar-file-input"
                        style={{
                          position: 'absolute',
                          bottom: '-4px',
                          right: '-4px',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--primary)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid var(--bg-surface)',
                          boxShadow: 'var(--shadow-sm)',
                          cursor: uploadingAvatar ? 'wait' : 'pointer',
                        }}
                        title="Tải ảnh mới từ máy tính"
                      >
                        {uploadingAvatar ? <Loader2 size={14} className="animate-pulse" /> : '📷'}
                      </label>
                    </div>

                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                        <label
                          htmlFor="avatar-file-input"
                          className="btn btn-primary"
                          style={{ height: '36px', padding: '0 14px', fontSize: '0.82rem', cursor: uploadingAvatar ? 'wait' : 'pointer' }}
                        >
                          {uploadingAvatar ? 'Đang tải lên...' : 'Tải ảnh từ máy'}
                        </label>

                        {profileData.avatar && (
                          <button
                            type="button"
                            onClick={() => setProfileData((prev) => ({ ...prev, avatar: '' }))}
                            className="btn btn-ghost"
                            style={{ height: '36px', padding: '0 12px', fontSize: '0.82rem', color: 'var(--danger)' }}
                            disabled={uploadingAvatar}
                          >
                            Xóa ảnh
                          </button>
                        )}
                      </div>

                      <p style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                        Chọn ảnh từ thiết bị hoặc chọn nhanh các avatar mẫu:
                      </p>

                      {/* Presets List */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        {AVATAR_PRESETS.map((presetUrl, idx) => (
                          <img
                            key={idx}
                            src={presetUrl}
                            alt={`Preset ${idx + 1}`}
                            onClick={() => setProfileData((prev) => ({ ...prev, avatar: presetUrl }))}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              cursor: 'pointer',
                              border: profileData.avatar === presetUrl ? '2px solid var(--primary)' : '1px solid var(--border)',
                              opacity: profileData.avatar === presetUrl ? 1 : 0.7,
                              transition: 'all 0.15s ease',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                      Lời giới thiệu (Bio)
                    </label>
                    <textarea
                      className="form-input"
                      rows={3}
                      style={{ height: 'auto', padding: '10px 14px' }}
                      placeholder="Chia sẻ đôi lời về bản thân hoặc công nghệ yêu thích..."
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                        Số điện thoại
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="0987654321"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                        Giới tính
                      </label>
                      <select
                        className="form-input"
                        value={profileData.gender}
                        onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                      >
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ marginTop: '16px', height: '46px', alignSelf: 'flex-start', padding: '0 24px' }}
                    disabled={loading}
                  >
                    {loading ? <Loader2 size={18} className="animate-pulse" /> : <Save size={18} />}
                    <span>Lưu Thay Đổi</span>
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <form onSubmit={handleChangePassword}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '20px' }}>Bảo Mật & Đổi Mật Khẩu</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '440px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Tối thiểu 6 ký tự"
                      value={passData.newPass}
                      onChange={(e) => setPassData({ ...passData, newPass: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                      Xác nhận mật khẩu mới
                    </label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Nhập lại mật khẩu mới"
                      value={passData.confirmPass}
                      onChange={(e) => setPassData({ ...passData, confirmPass: e.target.value })}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ marginTop: '16px', height: '46px', alignSelf: 'flex-start', padding: '0 24px' }}
                    disabled={loading}
                  >
                    {loading ? <Loader2 size={18} className="animate-pulse" /> : <ShieldCheck size={18} />}
                    <span>Cập Nhật Mật Khẩu</span>
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'preferences' && (
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '20px' }}>Tùy Chọn Giao Diện & Âm Thanh</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Theme setting */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: '14px', border: '1px solid var(--border)' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Chế Độ Giao Diện</h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Hiện tại đang sử dụng theme <strong>{theme === 'dark' ? 'Cyber Dark' : 'Clean Light'}</strong>
                      </p>
                    </div>

                    <button onClick={toggleTheme} className="btn btn-ghost" style={{ border: '1px solid var(--border)' }}>
                      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                      <span>{theme === 'dark' ? 'Đổi sang Sáng' : 'Đổi sang Tối'}</span>
                    </button>
                  </div>

                  {/* Sound setting */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: '14px', border: '1px solid var(--border)' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Âm Thanh Web Audio</h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Phát âm thanh chuông khi có tin nhắn mới hoặc thông báo kết bạn
                      </p>
                    </div>

                    <button onClick={handleToggleSound} className="btn btn-ghost" style={{ border: '1px solid var(--border)' }}>
                      {soundEnabled ? <Volume2 size={16} color="var(--primary)" /> : <VolumeX size={16} color="var(--text-subtle)" />}
                      <span>{soundEnabled ? 'Đang Bật' : 'Đã Tắt'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ImageViewerModal
        isOpen={isViewerOpen}
        imageUrl={viewerImage}
        altText="Ảnh đại diện"
        onClose={() => setIsViewerOpen(false)}
      />

      <Footer />
    </div>
  );
};

export default SettingsPage;
