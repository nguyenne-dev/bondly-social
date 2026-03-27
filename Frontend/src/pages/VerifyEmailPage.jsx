import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { MailCheck, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const navigate = useNavigate();
  const { verifyOtp } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp.trim() || !email.trim()) {
      addToast('Vui lòng nhập đầy đủ email và mã OTP', 'error');
      return;
    }

    try {
      setLoading(true);
      await verifyOtp(email.trim(), otp.trim());
      addToast('Xác thực email thành công! Bạn có thể đăng nhập ngay.', 'success');
      navigate('/login');
    } catch (err) {
      addToast(err.message || 'Mã OTP không hợp lệ hoặc đã hết hạn', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'radial-gradient(circle at top center, rgba(6, 182, 212, 0.12) 0%, var(--bg-app) 70%)',
      }}
    >
      <div
        className="glass-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '36px 32px',
          backgroundColor: 'var(--bg-surface)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '18px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}
        >
          <MailCheck size={28} />
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px' }}>Xác Thực Email</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.6 }}>
          Nhập mã OTP 6 số đã được gửi tới hòm thư của bạn để kích hoạt tài khoản
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="email"
            className="form-input"
            placeholder="Email đăng ký"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="text"
            className="form-input"
            style={{
              textAlign: 'center',
              letterSpacing: '6px',
              fontSize: '1.4rem',
              fontWeight: 800,
              height: '52px',
            }}
            maxLength={6}
            placeholder="● ● ● ● ● ●"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            autoFocus
          />

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', height: '46px', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? <Loader2 size={18} className="animate-pulse" /> : <CheckCircle2 size={18} />}
            <span>Kích Hoạt Tài Khoản</span>
          </button>
        </form>

        <div style={{ marginTop: '24px', fontSize: '0.88rem' }}>
          <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            Quay lại đăng nhập <ArrowRight size={14} style={{ verticalAlign: 'middle' }} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
