import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MessageSquare, Shield, Zap, Heart, Github, Globe, Server } from 'lucide-react';

export const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        padding: '60px 24px 30px',
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          marginBottom: '50px',
        }}
      >
        {/* Col 1: Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(6, 182, 212, 0.4)',
              }}
            >
              <Sparkles size={18} color="#fff" />
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Nex<span className="gradient-text">Chat</span> Realtime
            </span>
          </div>
          <p style={{ lineHeight: 1.6, marginBottom: '20px' }}>
            Nền tảng nhắn tin và tương tác thời gian thực thế hệ mới. Xây dựng trên nền tảng WebSockets hai chiều với độ trễ phản hồi cực thấp.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
              🟢 WebSocket 100% Online
            </span>
          </div>
        </div>

        {/* Col 2: Navigation Links */}
        <div>
          <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: 700, marginBottom: '18px' }}>
            Điều Hướng
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.15s' }}>
                Trang Chủ
              </Link>
            </li>
            <li>
              <Link to="/explore" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.15s' }}>
                Khám Phá Kênh Chat
              </Link>
            </li>
            <li>
              <Link to="/features" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.15s' }}>
                Kiến Trúc Kỹ Thuật
              </Link>
            </li>
            <li>
              <Link to="/chat" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.15s' }}>
                Vào Phòng Chat
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Technology & Specs */}
        <div>
          <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: 700, marginBottom: '18px' }}>
            Công Nghệ Cốt Lõi
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>⚡ Socket.IO WebSocket Engine</li>
            <li>⚛️ React 18 + Vite SPA</li>
            <li>🍃 MongoDB Indexing & Mongoose</li>
            <li>🔒 JWT Auth & Cookie HttpOnly</li>
            <li>🎵 Web Audio API Synthesizer</li>
            <li>🎨 Cyber Dark Design System</li>
          </ul>
        </div>

        {/* Col 4: Quick Start */}
        <div>
          <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: 700, marginBottom: '18px' }}>
            Bắt Đầu Nhanh
          </h4>
          <p style={{ lineHeight: 1.6, marginBottom: '16px' }}>
            Tạo tài khoản chỉ trong 30 giây và kết nối ngay với bạn bè cùng cộng đồng công nghệ.
          </p>
          <Link
            to="/register"
            className="btn btn-primary"
            style={{ display: 'inline-flex', height: '40px', padding: '0 20px', textDecoration: 'none' }}
          >
            Đăng Ký Miễn Phí
          </Link>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          paddingTop: '24px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          fontSize: '0.85rem',
        }}
      >
        <div>
          © 2026 <strong>NexChat Realtime Platform</strong>. Phát triển bởi <span className="gradient-text" style={{ fontWeight: 700 }}>Nguyên Dev</span>.
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span>Tốc độ: &lt; 15ms</span>
          <span>Bảo mật: JWT SHA-256</span>
          <span>Uptime: 99.98%</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
