import React, { useEffect } from 'react';
import { X, Download, ZoomIn } from 'lucide-react';

export const ImageViewerModal = ({ isOpen, imageUrl, altText = 'Ảnh', onClose }) => {
  // ESC key listener to close modal without layout shift
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

  if (!isOpen || !imageUrl) return null;

  const handleDownload = (e) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `bondly_image_${Date.now()}.png`;
    link.target = '_blank';
    link.rel = 'noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      onClick={onClose}
      className="animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(5, 8, 16, 0.92)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        cursor: 'zoom-out',
      }}
    >
      {/* Top Action Controls */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 10000,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleDownload}
          className="btn-icon"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
          title="Tải ảnh về máy"
        >
          <Download size={20} />
        </button>

        <button
          onClick={onClose}
          className="btn-icon"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
          title="Đóng (ESC)"
        >
          <X size={22} />
        </button>
      </div>

      {/* Centered Image */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '90vw',
          maxHeight: '88vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'default',
        }}
      >
        <img
          src={imageUrl}
          alt={altText}
          style={{
            maxWidth: '100%',
            maxHeight: '88vh',
            objectFit: 'contain',
            borderRadius: '16px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            animation: 'bubblePop 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        />
      </div>
    </div>
  );
};

export default ImageViewerModal;
