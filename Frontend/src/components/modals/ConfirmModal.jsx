import React, { useEffect } from 'react';
import { AlertCircle, AlertTriangle, X } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  title = 'Xác nhận thao tác',
  message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  confirmType = 'danger',
  onConfirm,
  onClose,
}) => {
  // ESC listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(5, 8, 16, 0.75)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-card animate-bubble-pop"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '28px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header with Icon */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: confirmType === 'danger' ? 'var(--danger-bg)' : 'var(--primary-light)',
              color: confirmType === 'danger' ? 'var(--danger)' : 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {confirmType === 'danger' ? <AlertTriangle size={22} /> : <AlertCircle size={22} />}
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
              {title}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {message}
            </p>
          </div>

          <button onClick={onClose} className="btn-icon" style={{ width: '32px', height: '32px', flexShrink: 0 }}>
            <X size={16} />
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ height: '40px', padding: '0 18px', fontSize: '0.9rem' }}
          >
            {cancelText}
          </button>

          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={confirmType === 'danger' ? 'btn' : 'btn btn-primary'}
            style={{
              height: '40px',
              padding: '0 20px',
              fontSize: '0.9rem',
              ...(confirmType === 'danger'
                ? {
                    backgroundColor: 'var(--danger)',
                    color: '#fff',
                    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                  }
                : {}),
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
