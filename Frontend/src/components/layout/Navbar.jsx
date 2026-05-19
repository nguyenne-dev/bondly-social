import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { userApi } from '../../api/user.api';
import Avatar from '../common/Avatar';
import {
  Link2,
  Home,
  Compass,
  Cpu,
  Sun,
  Moon,
  LogIn,
  UserPlus,
  LogOut,
  MessageSquare,
  Search,
  Loader2,
  X,
  Menu,
  Settings
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Search in Header State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef(null);

  // Mobile menu open state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu and search dropdown on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowSearchDropdown(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Search Debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await userApi.searchUsers(searchQuery.trim());
        setSearchResults(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        console.error('Lỗi tìm kiếm user trên header:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const navLinks = [
    { name: 'Trang Chủ', path: '/', icon: Home },
    { name: 'Khám Phá', path: '/explore', icon: Compass },
    { name: 'Kiến Trúc & Tính Năng', path: '/features', icon: Cpu },
  ];

  const handleStartChatWithPartner = (partnerId) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    setMobileMenuOpen(false);
    navigate(`/chat?partnerId=${partnerId}`);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <>
      <header className="navbar-header">
        <div className="navbar-container">
          {/* 1. Left Area: Brand & Desktop Navigation Links */}
          <div className="navbar-left-area">
            <Link to="/" className="navbar-brand">
              <div className="navbar-logo-icon">
                <Link2 size={20} color="#fff" />
              </div>
              <div>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.1, display: 'block' }}>
                  Bond<span className="gradient-text">ly</span>
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    letterSpacing: '1.2px',
                    textTransform: 'uppercase',
                  }}
                >
                  Social Network
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="navbar-nav-links">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`navbar-nav-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={16} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* 2. Right Area: Search, Theme Toggle, Auth Actions & Mobile Toggle */}
          <div className="navbar-right-area">
            {/* Live User Search (Desktop) */}
            {isAuthenticated && (
              <div ref={searchContainerRef} className="navbar-search-wrapper">
                <div className="navbar-search-input-box">
                  <Search size={16} color="var(--text-subtle)" style={{ flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm bạn bè..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSearchDropdown(true);
                    }}
                    onFocus={() => setShowSearchDropdown(true)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: 'var(--text-main)',
                      fontSize: '0.88rem',
                      width: '100%',
                      minWidth: 0,
                    }}
                  />
                  {isSearching ? (
                    <Loader2 size={14} className="animate-spin" color="var(--primary)" style={{ flexShrink: 0 }} />
                  ) : searchQuery ? (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-subtle)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0,
                      }}
                      aria-label="Xóa từ khóa tìm kiếm"
                    >
                      <X size={14} />
                    </button>
                  ) : null}
                </div>

                {/* Floating Dropdown Results */}
                {showSearchDropdown && searchQuery.trim().length > 0 && (
                  <div
                    className="glass-card animate-bubble-pop"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      left: 0,
                      right: 0,
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      boxShadow: 'var(--shadow-lg)',
                      maxHeight: '320px',
                      overflowY: 'auto',
                      zIndex: 1100,
                      padding: '6px',
                    }}
                  >
                    {isSearching ? (
                      <div style={{ padding: '14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Đang tìm kiếm...
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div style={{ padding: '14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Không tìm thấy người dùng phù hợp
                      </div>
                    ) : (
                      searchResults.map((u) => (
                        <div
                          key={u._id}
                          onClick={() => handleStartChatWithPartner(u._id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease',
                            gap: '10px',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                            <Avatar user={u} size={32} borderRadius="8px" />
                            <div style={{ overflow: 'hidden' }}>
                              <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {u.fullName || u.username}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                @{u.username}
                              </div>
                            </div>
                          </div>

                          <button
                            className="btn btn-primary"
                            style={{ height: '30px', padding: '0 10px', fontSize: '0.78rem', gap: '4px', flexShrink: 0 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartChatWithPartner(u._id);
                            }}
                          >
                            <MessageSquare size={12} />
                            <span>Nhắn tin</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="btn-icon"
              style={{ width: '40px', height: '40px', borderRadius: '10px' }}
              title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
              aria-label="Chuyển đổi giao diện sáng tối"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Desktop Auth Controls */}
            <div className="navbar-auth-desktop" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/chat"
                    className="btn btn-primary"
                    style={{ height: '40px', padding: '0 18px', textDecoration: 'none', fontSize: '0.9rem', gap: '6px' }}
                  >
                    <MessageSquare size={16} />
                    <span>Mở Chat</span>
                  </Link>

                  <Link
                    to="/settings"
                    style={{
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      height: '40px',
                      padding: '0 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-subtle)',
                      color: 'var(--text-main)',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      transition: 'border-color 0.2s, background-color 0.2s',
                    }}
                    title="Cài đặt tài khoản"
                  >
                    <Avatar user={user} size={26} borderRadius="6px" />
                    <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.fullName || user?.username}
                    </span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn btn-ghost"
                    style={{ height: '40px', padding: '0 16px', textDecoration: 'none', fontSize: '0.9rem' }}
                  >
                    <LogIn size={16} />
                    <span>Đăng Nhập</span>
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-primary"
                    style={{ height: '40px', padding: '0 18px', textDecoration: 'none', fontSize: '0.9rem' }}
                  >
                    <UserPlus size={16} />
                    <span>Đăng Ký</span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="navbar-mobile-toggle"
              aria-label={mobileMenuOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
              title="Menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* 3. Fullscreen Mobile Menu Drawer (Rendered via Portal to Document Body) */}
      {mobileMenuOpen &&
        createPortal(
          <div className="navbar-mobile-portal-drawer animate-fade-in">
            {/* Mobile Search Bar (when logged in) */}
            {isAuthenticated && (
              <div style={{ position: 'relative', width: '100%' }}>
                <div className="navbar-search-input-box" style={{ height: '46px', padding: '0 14px' }}>
                  <Search size={18} color="var(--text-subtle)" style={{ flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm bạn bè..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: 'var(--text-main)',
                      fontSize: '0.95rem',
                      width: '100%',
                    }}
                  />
                  {isSearching ? (
                    <Loader2 size={16} className="animate-spin" color="var(--primary)" style={{ flexShrink: 0 }} />
                  ) : searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-subtle)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0,
                      }}
                      aria-label="Xóa từ khóa tìm kiếm"
                    >
                      <X size={16} />
                    </button>
                  ) : null}
                </div>

                {/* Live search results in mobile drawer */}
                {searchQuery.trim().length > 0 && (
                  <div
                    className="glass-card"
                    style={{
                      marginTop: '8px',
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      padding: '8px',
                      maxHeight: '220px',
                      overflowY: 'auto',
                    }}
                  >
                    {isSearching ? (
                      <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        Đang tìm kiếm...
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        Không tìm thấy người dùng phù hợp
                      </div>
                    ) : (
                      searchResults.map((u) => (
                        <div
                          key={u._id}
                          onClick={() => handleStartChatWithPartner(u._id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            gap: '10px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                            <Avatar user={u} size={32} borderRadius="8px" />
                            <div style={{ overflow: 'hidden' }}>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {u.fullName || u.username}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                @{u.username}
                              </div>
                            </div>
                          </div>
                          <button className="btn btn-primary" style={{ height: '30px', padding: '0 12px', fontSize: '0.8rem', flexShrink: 0 }}>
                            Nhắn tin
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Navigation Links in Mobile */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '1px', paddingLeft: '4px' }}>
                Điều Hướng Trang
              </span>
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      textDecoration: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: isActive ? 'var(--primary)' : 'var(--text-main)',
                      backgroundColor: isActive ? 'var(--primary-light)' : 'var(--bg-surface)',
                      border: '1px solid',
                      borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Icon size={20} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Auth Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '1px', paddingLeft: '4px' }}>
                Tài Khoản & Hành Động
              </span>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/chat"
                    className="btn btn-primary"
                    style={{ height: '48px', textDecoration: 'none', fontSize: '0.98rem', justifyContent: 'center', gap: '8px' }}
                  >
                    <MessageSquare size={18} />
                    <span>Vào Màn Hình Chat</span>
                  </Link>

                  <Link
                    to="/settings"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      textDecoration: 'none',
                      fontSize: '0.96rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <Avatar user={user} size={36} borderRadius="10px" />
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{user?.fullName || user?.username}</span>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Cài đặt hồ sơ & tùy chỉnh</span>
                    </div>
                    <Settings size={18} color="var(--text-subtle)" style={{ marginLeft: 'auto' }} />
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="btn btn-ghost"
                    style={{ height: '44px', color: 'var(--danger)', justifyContent: 'center', gap: '8px', border: '1px solid var(--border)' }}
                  >
                    <LogOut size={16} />
                    <span>Đăng Xuất</span>
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Link
                    to="/login"
                    className="btn btn-ghost"
                    style={{ height: '48px', textDecoration: 'none', fontSize: '0.98rem', justifyContent: 'center', border: '1px solid var(--border)' }}
                  >
                    <LogIn size={18} />
                    <span>Đăng Nhập</span>
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-primary"
                    style={{ height: '48px', textDecoration: 'none', fontSize: '0.98rem', justifyContent: 'center' }}
                  >
                    <UserPlus size={18} />
                    <span>Đăng Ký Tài Khoản</span>
                  </Link>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default Navbar;
