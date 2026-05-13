import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { userApi } from '../../api/user.api';
import Avatar from '../common/Avatar';
import { 
  Sparkles, 
  Link2,
  MessageSquare, 
  Compass, 
  Cpu, 
  Sun, 
  Moon, 
  LogIn, 
  UserPlus, 
  LogOut, 
  ArrowRight,
  Search,
  Loader2,
  UserCheck
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
    { name: 'Trang Chủ', path: '/' },
    { name: 'Khám Phá', path: '/explore' },
    { name: 'Kiến Trúc & Tính Năng', path: '/features' },
  ];

  const handleStartChatWithPartner = (partnerId) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    navigate(`/chat?partnerId=${partnerId}`);
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        height: '84px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(16px)',
        boxSizing: 'border-box',
        transition: 'background-color 0.25s, border-color 0.25s',
      }}
    >
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '0 32px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          boxSizing: 'border-box',
        }}
      >
        {/* 1. Logo & Brand */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            textDecoration: 'none',
            color: 'var(--text-main)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(6, 182, 212, 0.4)',
              flexShrink: 0,
            }}
          >
            <Link2 size={22} color="#fff" />
          </div>
          <div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.2, display: 'block' }}>
              Bond<span className="gradient-text">ly</span>
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '0.68rem',
                fontWeight: 700,
                color: 'var(--primary)',
                letterSpacing: '1.4px',
                textTransform: 'uppercase',
              }}
            >
              Social Network
            </span>
          </div>
        </Link>

        {/* 2. Center: Search Bar (when Authenticated) & Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, justifyContent: 'center' }}>
          {/* Navigation Links */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            className="desktop-nav"
          >
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    fontSize: '0.96rem',
                    fontWeight: 600,
                    color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                    backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                    transition: 'background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxSizing: 'border-box',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Live User Search on Header (only when logged in) */}
          {isAuthenticated && (
            <div
              ref={searchContainerRef}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '320px',
              }}
              className="desktop-nav"
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  padding: '0 14px',
                  height: '44px',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxShadow: showSearchDropdown ? '0 0 0 2px var(--border-focus)' : 'none',
                }}
              >
                <Search size={18} color="var(--text-subtle)" />
                <input
                  type="text"
                  placeholder="Tìm kiếm người dùng..."
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
                    fontSize: '0.92rem',
                    width: '100%',
                  }}
                />
                {isSearching && <Loader2 size={16} className="animate-spin" color="var(--primary)" />}
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
                    maxHeight: '340px',
                    overflowY: 'auto',
                    zIndex: 1100,
                    padding: '8px',
                  }}
                >
                  {isSearching ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                      Đang tìm kiếm...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
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
                          transition: 'background-color 0.15s ease',
                          gap: '10px',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                          <Avatar user={u} size={34} borderRadius="10px" />
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {u.fullName || u.username}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              @{u.username}
                            </div>
                          </div>
                        </div>

                        <button
                          className="btn btn-primary"
                          style={{ height: '32px', padding: '0 12px', fontSize: '0.8rem', gap: '4px', flexShrink: 0 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartChatWithPartner(u._id);
                          }}
                        >
                          <MessageSquare size={13} />
                          <span>Nhắn tin</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn-icon"
            style={{ width: '44px', height: '44px', borderRadius: '12px' }}
            title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
          >
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link
                to="/chat"
                className="btn btn-primary"
                style={{ height: '44px', padding: '0 22px', textDecoration: 'none', fontSize: '0.94rem' }}
              >
                <MessageSquare size={17} />
                <span>Mở Chat</span>
              </Link>

              <Link
                to="/settings"
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  height: '44px',
                  padding: '0 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  transition: 'border-color 0.2s, background-color 0.2s',
                  boxSizing: 'border-box',
                }}
              >
                <Avatar user={user} size={30} borderRadius="8px" />
                <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.fullName || user?.username}
                </span>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link
                to="/login"
                className="btn btn-ghost"
                style={{ height: '44px', padding: '0 20px', textDecoration: 'none', fontSize: '0.94rem' }}
              >
                <LogIn size={17} />
                <span>Đăng Nhập</span>
              </Link>
              <Link
                to="/register"
                className="btn btn-primary"
                style={{ height: '44px', padding: '0 22px', textDecoration: 'none', fontSize: '0.94rem' }}
              >
                <UserPlus size={17} />
                <span>Đăng Ký</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
