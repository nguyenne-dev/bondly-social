import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SoundboardWidget from '../components/common/SoundboardWidget';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  MessageSquare, 
  Smile, 
  Volume2, 
  Users, 
  Flame, 
  CheckCircle2, 
  ArrowRight, 
  Send, 
  RotateCcw,
  Layers,
  Activity,
  Heart,
  CheckCheck
} from 'lucide-react';

export const HomePage = () => {
  const { isAuthenticated } = useAuth();

  // Demo simulator state - realistic conversation between teammates
  const [demoMessages, setDemoMessages] = useState([
    {
      id: 1,
      sender: 'Hoàng Minh',
      isMe: false,
      text: 'Chào bạn! Bondly kết nối bạn bè thời gian thực với độ trễ phản hồi cực thấp 🔥',
      time: '10:42',
      reactions: ['🔥', '🚀'],
    },
    {
      id: 2,
      sender: 'Bạn',
      isMe: true,
      text: 'Giao diện Cyber Dark nhìn rất mượt, có cả âm thanh Web Audio và thả cảm xúc nữa 👍',
      time: '10:43',
      reactions: ['❤️'],
    },
    {
      id: 3,
      sender: 'Hoàng Minh',
      isMe: false,
      text: 'Đúng rồi! Cơ chế Draft Conversation giúp tạo cuộc trò chuyện tức thì không lo rác database.',
      time: '10:44',
      reactions: ['💯'],
    },
  ]);

  const [demoInput, setDemoInput] = useState('');

  // Send message directly without stiff robot
  const handleSendDemoMessage = (e) => {
    e?.preventDefault();
    if (!demoInput.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'Bạn',
      isMe: true,
      text: demoInput.trim(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      reactions: [],
    };

    setDemoMessages((prev) => [...prev, newMsg]);
    setDemoInput('');
  };

  // React to message directly
  const handleDemoReact = (msgId, emoji) => {
    setDemoMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId) {
          const exists = m.reactions.includes(emoji);
          return {
            ...m,
            reactions: exists ? m.reactions.filter((r) => r !== emoji) : [...m.reactions, emoji],
          };
        }
        return m;
      })
    );
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* 1. HERO SECTION */}
      <section
        style={{
          position: 'relative',
          padding: '80px 24px 60px',
          overflow: 'hidden',
          background: 'radial-gradient(ellipse at 50% 10%, rgba(6, 182, 212, 0.2) 0%, transparent 65%)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div
            className="animate-fade-in"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-light)',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              color: 'var(--primary)',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '24px',
            }}
          >
            <Zap size={15} />
            <span>Bondly Social v2.0 • Realtime Engine</span>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-1.5px',
              marginBottom: '22px',
            }}
          >
            Trò Chuyện Thời Gian Thực <br />
            <span className="gradient-text">Tốc Độ Tức Thì, Không Độ Trễ</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: 'var(--text-muted)',
              maxWidth: '760px',
              margin: '0 auto 36px',
              lineHeight: 1.6,
            }}
          >
            Kết nối bạn bè và cộng đồng công nghệ qua nền tảng WebSockets hai chiều. Hỗ trợ gửi ảnh, thả cảm xúc đa dạng, thu hồi tin nhắn an toàn và âm thanh Web Audio cao cấp.
          </p>

          {/* CTA Buttons */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              marginBottom: '50px',
            }}
          >
            <Link
              to={isAuthenticated ? '/chat' : '/register'}
              className="btn btn-primary"
              style={{
                height: '52px',
                padding: '0 32px',
                fontSize: '1.05rem',
                textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(6, 182, 212, 0.35)',
              }}
            >
              <MessageSquare size={20} />
              <span>{isAuthenticated ? 'Vào Ứng Dụng Chat' : 'Trải Nghiệm Miễn Phí'}</span>
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/explore"
              className="btn btn-ghost"
              style={{ height: '52px', padding: '0 28px', fontSize: '1.05rem', textDecoration: 'none', border: '1px solid var(--border)' }}
            >
              <Users size={18} />
              <span>Khám Phá Cộng Đồng</span>
            </Link>
          </div>

          {/* Metrics Bar */}
          <div
            className="glass-card cyber-card"
            style={{
              maxWidth: '900px',
              margin: '0 auto',
              padding: '24px 32px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '24px',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>&lt; 15ms</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Độ Trễ WebSocket</div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981' }}>100%</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Hai Chiều Realtime</div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f59e0b' }}>99.98%</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Thời Gian Hoạt Động</div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#8b5cf6' }}>0ms</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Tải Lại Trang (SPA)</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE DEMO SIMULATOR */}
      <section style={{ padding: '60px 24px', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Trải Nghiệm Trực Tiếp
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px' }}>
              Thử Nghiệm Giao Diện <span className="gradient-text">Bondly Simulator</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '8px' }}>
              Hãy thử gõ tin nhắn vào khung chat bên dưới và thả các biểu tượng cảm xúc
            </p>
          </div>

          {/* Interactive Chat Window Mockup */}
          <div
            className="glass-card cyber-card"
            style={{
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '16px 24px',
                backgroundColor: 'var(--bg-app)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src="https://ui-avatars.com/api/?name=Hoang+Minh&background=06b6d4&color=fff"
                    alt="Hoàng Minh"
                    style={{ width: '42px', height: '42px', borderRadius: '14px' }}
                  />
                  <span className="online-dot" style={{ position: 'absolute', bottom: '-2px', right: '-2px' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Hoàng Minh</h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--online)', fontWeight: 600 }}>
                    Đang trực tuyến
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', alignItems: 'center' }}>
                <span style={{ padding: '4px 10px', borderRadius: '6px', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700 }}>
                  ⚡ Socket.IO Connected
                </span>
              </div>
            </div>

            {/* Messages body */}
            <div
              style={{
                padding: '24px',
                minHeight: '280px',
                maxHeight: '340px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                backgroundColor: 'var(--bg-surface)',
              }}
            >
              {demoMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="animate-bubble-pop"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.isMe ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexDirection: msg.isMe ? 'row-reverse' : 'row',
                      maxWidth: '80%',
                    }}
                  >
                    <div
                      style={{
                        padding: '12px 18px',
                        borderRadius: msg.isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        background: msg.isMe ? 'var(--msg-sent-bg)' : 'var(--msg-received-bg)',
                        color: msg.isMe ? 'var(--msg-sent-color)' : 'var(--msg-received-color)',
                        boxShadow: msg.isMe ? '0 4px 14px rgba(6, 182, 212, 0.3)' : 'var(--shadow-sm)',
                        fontSize: '0.92rem',
                        lineHeight: 1.5,
                        position: 'relative',
                      }}
                    >
                      <p>{msg.text}</p>

                      {/* Emoji Reactions */}
                      {msg.reactions.length > 0 && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '-10px',
                            right: msg.isMe ? '8px' : 'auto',
                            left: msg.isMe ? 'auto' : '8px',
                            backgroundColor: 'var(--bg-surface)',
                            borderRadius: '12px',
                            padding: '2px 6px',
                            display: 'flex',
                            gap: '2px',
                            border: '1px solid var(--border)',
                            boxShadow: 'var(--shadow-sm)',
                            fontSize: '0.75rem',
                          }}
                        >
                          {msg.reactions.map((r, i) => (
                            <span key={i}>{r}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick Reactions Trigger */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {['❤️', '🔥', '👍'].map((em) => (
                        <button
                          key={em}
                          onClick={() => handleDemoReact(msg.id, em)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            opacity: 0.7,
                            padding: '2px',
                            transition: 'opacity 0.15s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>

                  <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
                    {msg.time}
                  </span>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSendDemoMessage}
              style={{
                padding: '16px 20px',
                backgroundColor: 'var(--bg-app)',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <input
                type="text"
                className="form-input"
                placeholder="Gõ tin nhắn thử nghiệm..."
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                style={{ height: '44px' }}
              />
              <button type="submit" className="btn btn-primary" style={{ height: '44px', padding: '0 20px' }}>
                <Send size={16} />
                <span>Gửi</span>
              </button>
            </form>
          </div>

          {/* Soundboard Widget */}
          <SoundboardWidget />
        </div>
      </section>

      {/* 3. CORE FEATURES GRID */}
      <section style={{ padding: '90px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Tính Năng Vượt Trội
          </span>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '8px' }}>
            Thiết Kế Cho Trải Nghiệm Giao Tiếp Hoàn Hảo
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '640px', margin: '12px auto 0' }}>
            Tích hợp toàn diện các công nghệ tiên tiến nhất từ tầng CSDL MongoDB tới giao diện React 18
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '28px',
          }}
        >
          {/* Card 1 */}
          <div className="glass-card cyber-card" style={{ padding: '32px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}
            >
              <Zap size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>
              WebSocket Hai Chiều Siêu Tốc
            </h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.92rem' }}>
              Kiến trúc Socket.IO Engine phát sóng trực tiếp các sự kiện gõ phím (typing), đã đọc (read receipt) và danh sách trực tuyến không cần F5.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card cyber-card" style={{ padding: '32px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}
            >
              <MessageSquare size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>
              Hội Thoại Thông Minh (Lazy Draft)
            </h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.92rem' }}>
              Cơ chế tạo đoạn chat nháp linh hoạt: CSDL chỉ lưu trữ khi có tin nhắn đầu tiên phát sinh, giữ cho cơ sở dữ liệu luôn gọn gàng và tối ưu.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card cyber-card" style={{ padding: '32px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}
            >
              <RotateCcw size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>
              Thu Hồi & Tương Tác Cảm Xúc
            </h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.92rem' }}>
              Thu hồi tin nhắn đã gửi an toàn cùng hệ thống thả Emoji đa dạng (❤️, 👍, 😂, 🔥) cập nhật tức thì trên mọi thiết bị tham gia.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-card cyber-card" style={{ padding: '32px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}
            >
              <Volume2 size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>
              Âm Thanh Web Audio Tinh Tế
            </h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.92rem' }}>
              Tự động tổng hợp âm thanh thông báo qua Web Audio API không phụ thuộc vào file MP3 tĩnh, cho hiệu ứng rung âm thanh thanh thoát và hiện đại.
            </p>
          </div>

          {/* Card 5 */}
          <div className="glass-card cyber-card" style={{ padding: '32px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(139, 92, 246, 0.15)',
                color: '#8b5cf6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}
            >
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>
              Quản Lý Bạn Bè & Vòng Tròn Kết Nối
            </h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.92rem' }}>
              Hệ thống lời mời kết bạn đa trạng thái (Đã gửi, Đã nhận, Chấp nhận, Hủy kết bạn) cùng tìm kiếm người dùng thông minh.
            </p>
          </div>

          {/* Card 6 */}
          <div className="glass-card cyber-card" style={{ padding: '32px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}
            >
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>
              Bảo Mật JWT & Mã Hóa Mật Khẩu
            </h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.92rem' }}>
              Xác thực phân tầng với JWT qua Cookie HttpOnly và Header Authorization Bearer, bảo vệ tối đa dữ liệu cá nhân của người dùng.
            </p>
          </div>
        </div>
      </section>

      {/* 4. CTA BANNER */}
      <section style={{ padding: '70px 24px', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div
          className="glass-card cyber-card"
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '50px 36px',
            textAlign: 'center',
            background: 'radial-gradient(circle at center, rgba(6, 182, 212, 0.2) 0%, var(--bg-surface) 80%)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
          }}
        >
          <h2 style={{ fontSize: '2.3rem', fontWeight: 900, marginBottom: '16px' }}>
            Sẵn Sàng Trải Nghiệm <span className="gradient-text">Bondly</span> Ngay Hôm Nay?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto 32px', lineHeight: 1.6 }}>
            Gia nhập cộng đồng người dùng và cùng trò chuyện với tốc độ cực nhanh hoàn toàn miễn phí.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link
              to={isAuthenticated ? '/chat' : '/register'}
              className="btn btn-primary"
              style={{ height: '50px', padding: '0 32px', fontSize: '1rem', textDecoration: 'none' }}
            >
              <span>{isAuthenticated ? 'Mở Hộp Chat Ngay' : 'Tạo Tài Khoản Miễn Phí'}</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
