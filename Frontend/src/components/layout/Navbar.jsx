import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sparkles, MessageSquare, Compass, Cpu, Sun, Moon, LogIn, UserPlus, LogOut, ArrowRight } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Trang Chủ', path: '/' },
    { name: 'Khám Phá', path: '/explore' },
    { name: 'Kiến Trúc & Tính Năng', path: '/features' },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(16px)',
        transition: 'background-color 0.25s, border-color 0.25s',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
            color: 'var(--text-main)',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(6, 182, 212, 0.4)',
            }}
          >
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
              Nex<span className="gradient-text">Chat</span>
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '0.65rem',
                fontWeight: 700,
                color: 'var(--primary)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginTop: '-2px',
              }}
            >
              Realtime Engine
            </span>
          </div>
        </Link>

        {/* Nav Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
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
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: '0.92rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn-icon"
            style={{ width: '40px', height: '40px' }}
            title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link
                to="/chat"
                className="btn btn-primary"
                style={{ height: '40px', padding: '0 18px', textDecoration: 'none' }}
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
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                }}
              >
                <img
                  src={
                    user?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user?.fullName || user?.username || 'User'
                    )}&background=06b6d4&color=fff`
                  }
                  alt={user?.fullName}
                  style={{ width: '28px', height: '28px', borderRadius: '8px', objectFit: 'cover' }}
                />
                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.fullName || user?.username}
                </span>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link
                to="/login"
                className="btn btn-ghost"
                style={{ height: '40px', padding: '0 16px', textDecoration: 'none' }}
              >
                <LogIn size={16} />
                <span>Đăng Nhập</span>
              </Link>
              <Link
                to="/register"
                className="btn btn-primary"
                style={{ height: '40px', padding: '0 18px', textDecoration: 'none' }}
              >
                <UserPlus size={16} />
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
