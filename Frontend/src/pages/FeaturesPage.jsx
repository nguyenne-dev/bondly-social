import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { 
  Cpu, 
  Zap, 
  ShieldCheck, 
  Database, 
  Volume2, 
  Activity, 
  Layers, 
  CheckCircle2, 
  ArrowRight,
  Server,
  Lock,
  Radio
} from 'lucide-react';

export const FeaturesPage = () => {
  const socketEvents = [
    { event: 'send_message', direction: 'Client ➔ Server', payload: '{ receiverId, text, media, conversationId }', desc: 'Gửi tin nhắn kèm nội dung hoặc đính kèm ảnh đa phương tiện' },
    { event: 'receive_message', direction: 'Server ➔ Client', payload: '{ message, conversationId }', desc: 'Phát sóng tin nhắn tới người nhận hoặc các tab khác của người gửi' },
    { event: 'typing / stop_typing', direction: 'Hai chiều', payload: '{ receiverId, conversationId }', desc: 'Hiển thị trạng thái đang soạn tin nhắn với debounce 2000ms' },
    { event: 'mark_as_read', direction: 'Client ➔ Server', payload: '{ conversationId, senderId }', desc: 'Cập nhật trạng thái đã xem và reset huy hiệu tin nhắn chưa đọc' },
    { event: 'recall_message', direction: 'Hai chiều', payload: '{ messageId, receiverId, conversationId }', desc: 'Thu hồi tin nhắn an toàn đã gửi phía cả 2 đầu người dùng' },
    { event: 'react_message', direction: 'Hai chiều', payload: '{ messageId, emoji, conversationId }', desc: 'Thả cảm xúc Emoji tương tác (❤️, 👍, 😂, 🔥, 🎉)' },
    { event: 'get_online_users', direction: 'Server ➔ Client', payload: 'Array<userId>', desc: 'Danh sách toàn bộ người dùng đang online thời gian thực' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero Header */}
      <section
        style={{
          padding: '70px 24px 50px',
          textAlign: 'center',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '16px',
            }}
          >
            <Cpu size={16} />
            <span>Kỹ Thuật & Kiến Trúc Hệ Thống</span>
          </div>

          <h1 style={{ fontSize: '2.6rem', fontWeight: 900, marginBottom: '16px' }}>
            Sức Mạnh Kỹ Thuật Đằng Sau <span className="gradient-text">Bondly</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6 }}>
            Khám phá chi tiết kiến trúc WebSocket phân tán, tối ưu hóa CSDL MongoDB Indexing, tổng hợp âm thanh Web Audio và cơ chế bảo mật đa tầng.
          </p>
        </div>
      </section>

      {/* Main Content Sections */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px', flex: 1, width: '100%' }}>
        {/* 1. Architecture Flow */}
        <section style={{ marginBottom: '80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>1. Sơ Đồ Luồng Dữ Liệu Realtime</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
              Quy trình gửi nhận tin nhắn với thời gian trễ dưới 15ms
            </p>
          </div>

          <div
            className="glass-card cyber-card"
            style={{
              padding: '36px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <div style={{ padding: '20px', backgroundColor: 'var(--bg-subtle)', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <Radio size={32} color="var(--primary)" style={{ marginBottom: '12px' }} />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>1. Client Gửi Socket</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Client phát sự kiện <code>send_message</code> qua kết nối WebSocket đã chứng thực JWT.
              </p>
            </div>

            <div style={{ padding: '20px', backgroundColor: 'var(--bg-subtle)', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <Server size={32} color="#10b981" style={{ marginBottom: '12px' }} />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>2. Socket Gateway</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Server Express + Socket.IO tiếp nhận, giải mã User token và xác thực quyền hạn.
              </p>
            </div>

            <div style={{ padding: '20px', backgroundColor: 'var(--bg-subtle)', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <Database size={32} color="#f59e0b" style={{ marginBottom: '12px' }} />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>3. MongoDB Persistence</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Lưu tin nhắn vào CSDL, cập nhật lastMessage và số đếm unreadCounts tối ưu Indexing.
              </p>
            </div>

            <div style={{ padding: '20px', backgroundColor: 'var(--bg-subtle)', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <Zap size={32} color="#8b5cf6" style={{ marginBottom: '12px' }} />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>4. Broadcast Tức Thì</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Gửi sự kiện <code>receive_message</code> tới toàn bộ socket đang mở của người nhận.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Socket Event Specs Table */}
        <section style={{ marginBottom: '80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>2. Bảng Đặc Tả Sự Kiện WebSocket (Specs)</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
              Danh sách chi tiết các API events tương tác thời gian thực
            </p>
          </div>

          <div
            className="glass-card"
            style={{
              padding: '24px',
              overflowX: 'auto',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-main)' }}>
                  <th style={{ padding: '14px 16px' }}>Tên Sự Kiện</th>
                  <th style={{ padding: '14px 16px' }}>Chiều Giao Tiếp</th>
                  <th style={{ padding: '14px 16px' }}>Dữ Liệu (Payload)</th>
                  <th style={{ padding: '14px 16px' }}>Chức Năng</th>
                </tr>
              </thead>
              <tbody>
                {socketEvents.map((ev, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--bg-subtle)',
                    }}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--primary)' }}>
                      <code>{ev.event}</code>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{ev.direction}</td>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-subtle)' }}>
                      {ev.payload}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{ev.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. Performance Benchmark Matrix */}
        <section style={{ marginBottom: '80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>3. So Sánh Hiệu Năng Truyền Tải</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
              Tại sao Bondly lựa chọn kiến trúc WebSockets thuần thay vì HTTP Polling truyền thống
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            <div className="glass-card" style={{ padding: '30px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ef4444', marginBottom: '12px' }}>
                HTTP Polling Truyền Thống
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <li>❌ Độ trễ: 1,000ms – 5,000ms</li>
                <li>❌ Tiêu tốn băng thông HTTP Header liên tục</li>
                <li>❌ Server quá tải khi hàng ngàn client gửi request</li>
                <li>❌ Trải nghiệm nhắn tin giật lag</li>
              </ul>
            </div>

            <div className="glass-card" style={{ padding: '30px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f59e0b', marginBottom: '12px' }}>
                Long Polling / SSE
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <li>⚠️ Độ trễ: 100ms – 300ms</li>
                <li>⚠️ Chỉ hỗ trợ truyền 1 chiều (Server ➔ Client)</li>
                <li>⚠️ Thường xuyên bị ngắt kết nối và phải handshake lại</li>
                <li>⚠️ Khó mở rộng xử lý Typing Indicator</li>
              </ul>
            </div>

            <div className="glass-card" style={{ padding: '30px', border: '2px solid var(--primary)', background: 'radial-gradient(circle at top, rgba(6, 182, 212, 0.15) 0%, var(--bg-surface) 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                  Bondly WebSocket Engine
                </h4>
                <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', background: 'var(--primary)', color: '#fff', fontWeight: 700 }}>
                  CHUẨN HIỆN ĐẠI
                </span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                <li>✅ Độ trễ: &lt; 15ms (Gần như tức thì)</li>
                <li>✅ Kết nối Full-Duplex hai chiều liên tục</li>
                <li>✅ Giảm 90% tải server so với Polling</li>
                <li>✅ Hỗ trợ âm thanh Web Audio và Presence tức thì</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4. CTA */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link
            to="/chat"
            className="btn btn-primary"
            style={{ display: 'inline-flex', height: '48px', padding: '0 32px', fontSize: '1rem', textDecoration: 'none' }}
          >
            <span>Trải Nghiệm Hệ Thống Ngay</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FeaturesPage;
