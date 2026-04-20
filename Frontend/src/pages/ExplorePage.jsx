import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  Compass, 
  Search, 
  Users, 
  MessageSquare, 
  Code, 
  Palette, 
  Gamepad2, 
  Coffee, 
  BookOpen, 
  GitBranch, 
  Zap, 
  Sparkles,
  UserPlus
} from 'lucide-react';

export const ExplorePage = () => {
  const { isAuthenticated } = useAuth();
  const { onlineUsers } = useSocket();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Tất Cả Kênh' },
    { id: 'tech', name: 'Công Nghệ & Code' },
    { id: 'design', name: 'UI/UX Design' },
    { id: 'gaming', name: 'Gaming' },
    { id: 'chill', name: 'Trò Chuyện Tự Do' },
  ];

  const channels = [
    {
      id: 'tech-hub',
      title: '#tech-hub • Lập Trình Viên',
      category: 'tech',
      desc: 'Bàn luận kiến trúc Fullstack, React 18, Node.js, WebSockets và AI Engineering cùng các lập trình viên.',
      members: 3420,
      activeNow: 148,
      tags: ['JavaScript', 'React', 'Node.js', 'WebSockets', 'AI'],
      icon: <Code size={22} color="var(--primary)" />,
    },
    {
      id: 'design-uiux',
      title: '#design-uiux • Sáng Tạo & Giao Diện',
      category: 'design',
      desc: 'Không gian chia sẻ thiết kế giao diện Figma, Glassmorphism, Micro-animations và hệ thống Design System.',
      members: 1850,
      activeNow: 64,
      tags: ['Figma', 'UI/UX', 'Glassmorphism', 'DesignSystem'],
      icon: <Palette size={22} color="#ec4899" />,
    },
    {
      id: 'gaming-lounge',
      title: '#gaming-lounge • Đấu Trường Game',
      category: 'gaming',
      desc: 'Tìm đồng đội leo rank, chia sẻ mẹo chơi game và thảo luận về các tựa game Esports hot nhất.',
      members: 2190,
      activeNow: 95,
      tags: ['Esports', 'PC Gaming', 'Co-op', 'Streaming'],
      icon: <Gamepad2 size={22} color="#8b5cf6" />,
    },
    {
      id: 'casual-hangout',
      title: '#casual-hangout • Quán Cà Phê Online',
      category: 'chill',
      desc: 'Kênh trò chuyện tự do, chia sẻ playlist âm nhạc, góc làm việc và các chủ đề đời sống hàng ngày.',
      members: 4600,
      activeNow: 210,
      tags: ['Music', 'Chill', 'Daily Life', 'Networking'],
      icon: <Coffee size={22} color="#f59e0b" />,
    },
    {
      id: 'study-hub',
      title: '#study-hub • Ôn Luyện & Phỏng Vấn',
      category: 'tech',
      desc: 'Cùng nhau giải thuật toán LeetCode, chuẩn bị CV phỏng vấn Backend/Frontend và học tập mỗi ngày.',
      members: 1240,
      activeNow: 52,
      tags: ['LeetCode', 'Interview', 'Computer Science'],
      icon: <BookOpen size={22} color="#10b981" />,
    },
    {
      id: 'open-source',
      title: '#open-source • Mã Nguồn Mở',
      category: 'tech',
      desc: 'Đóng góp dự án mã nguồn mở, chia sẻ repositories thú vị và cùng xây dựng các công cụ hữu ích cho cộng đồng.',
      members: 950,
      activeNow: 38,
      tags: ['GitHub', 'OpenSource', 'Libraries'],
      icon: <GitBranch size={22} color="#06b6d4" />,
    },
  ];

  const filteredChannels = channels.filter((ch) => {
    const matchesCategory = activeCategory === 'all' || ch.category === activeCategory;
    const matchesSearch =
      ch.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ch.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ch.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleJoinChannel = (channel) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/chat');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Header Banner */}
      <section
        style={{
          padding: '60px 24px 40px',
          textAlign: 'center',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
            <Compass size={16} />
            <span>Khám Phá Kênh Cộng Đồng</span>
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '14px' }}>
            Kết Nối Với Những <span className="gradient-text">Kênh Chat Hàng Đầu</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '32px' }}>
            Tham gia các phòng chat theo chủ đề công nghệ, thiết kế, gaming hoặc kết nối trực tiếp với các lập trình viên đang trực tuyến.
          </p>

          {/* Search Box */}
          <div
            style={{
              position: 'relative',
              maxWidth: '560px',
              margin: '0 auto',
            }}
          >
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: '16px',
                top: '15px',
                color: 'var(--text-subtle)',
              }}
            />
            <input
              type="text"
              className="form-input"
              style={{
                paddingLeft: '48px',
                height: '50px',
                borderRadius: 'var(--radius-lg)',
                fontSize: '0.95rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }}
              placeholder="Tìm kiếm kênh chat, thẻ tags (#react, #gaming, #uiux)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px', flex: 1, width: '100%' }}>
        {/* Category Filters */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '36px',
            justifyContent: 'center',
          }}
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-full)',
                  border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'var(--bg-surface)',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Channels Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '24px',
          }}
        >
          {filteredChannels.map((ch) => (
            <div
              key={ch.id}
              className="glass-card cyber-card"
              style={{
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '14px',
                      backgroundColor: 'var(--bg-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {ch.icon}
                  </div>

                  <span
                    style={{
                      fontSize: '0.78rem',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'rgba(16, 185, 129, 0.12)',
                      color: '#10b981',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span className="online-dot" style={{ width: '8px', height: '8px' }} />
                    {ch.activeNow} đang chat
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>
                  {ch.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '18px' }}>
                  {ch.desc}
                </p>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
                  {ch.tags.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: '0.75rem',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--bg-subtle)',
                        color: 'var(--text-subtle)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer action */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={14} /> {ch.members.toLocaleString()} thành viên
                </span>

                <button
                  onClick={() => handleJoinChannel(ch)}
                  className="btn btn-primary"
                  style={{ height: '36px', padding: '0 16px', fontSize: '0.85rem' }}
                >
                  <MessageSquare size={14} />
                  <span>Tham Gia</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ExplorePage;
