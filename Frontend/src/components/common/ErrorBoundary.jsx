import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-app, #060913)',
            color: 'var(--text-main, #f8fafc)',
            padding: '24px',
            fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          <div
            className="glass-card animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '480px',
              padding: '36px 32px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-surface, #10172e)',
              borderRadius: 'var(--radius-lg, 20px)',
              border: '1px solid var(--border, rgba(255, 255, 255, 0.08))',
              boxShadow: 'var(--shadow-lg, 0 16px 48px rgba(0, 0, 0, 0.6))',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                backgroundColor: 'var(--danger-bg, rgba(239, 68, 68, 0.15))',
                color: 'var(--danger, #ef4444)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}
            >
              <AlertTriangle size={32} />
            </div>

            <h2
              style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                marginBottom: '10px',
                color: 'var(--text-main, #f8fafc)',
              }}
            >
              Đã xảy ra sự cố không mong muốn
            </h2>

            <p
              style={{
                fontSize: '0.92rem',
                color: 'var(--text-muted, #94a3b8)',
                lineHeight: 1.6,
                marginBottom: '28px',
              }}
            >
              Ứng dụng vừa gặp một lỗi kỹ thuật ngoài dự kiến. Vui lòng tải lại trang để tiếp tục trải nghiệm.
            </p>

            <button
              onClick={this.handleReload}
              className="btn btn-primary"
              style={{
                width: '100%',
                height: '46px',
                fontSize: '0.95rem',
                gap: '8px',
              }}
            >
              <RefreshCw size={18} />
              <span>Tải lại trang</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
