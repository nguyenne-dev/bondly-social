import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 28, message = 'Đang tải dữ liệu...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '30px',
        color: 'var(--text-muted)',
      }}
    >
      <Loader2 size={size} className="animate-spin" color="var(--primary)" />
      {message && <p style={{ fontSize: '0.88rem', fontWeight: 500 }}>{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
