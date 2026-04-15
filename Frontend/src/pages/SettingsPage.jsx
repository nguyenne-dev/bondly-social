import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/common/Toast';
import { api } from '../api/client';
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
    return localStorage.getItem('nexchat_sound') !== 'disabled';
  });

  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    localStorage.setItem('nexchat_sound', nextState ? 'enabled' : 'disabled');
    addToast(nextState ? 'Đã bật âm thanh thông báo' : 'Đã tắt âm thanh thông báo', 'info');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.put('user/profile', profileData);
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
      await api.post('user/me/change-pass', { newPass: passData.newPass });
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

                {/* Avatar Preview */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <img
                    src={
                      profileData.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        profileData.fullName || user?.username || 'User'
                      )}&background=06b6d4&color=fff`
                    }
                    alt="Avatar"
                    style={{ width: '70px', height: '70px', borderRadius: '20px', objectFit: 'cover', border: '2px solid var(--border)' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>@{user?.username}</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{user?.email}</p>
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

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                      Link ảnh đại diện (URL Avatar)
                    </label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://example.com/avatar.png"
                      value={profileData.avatar}
                      onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
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

      <Footer />
    </div>
  );
};

export default SettingsPage;
