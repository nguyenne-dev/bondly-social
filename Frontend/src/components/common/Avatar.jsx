import React from 'react';
import { getAvatarUrl } from '../../utils/avatar';

export const Avatar = ({
  user,
  src,
  alt,
  size = 40,
  borderRadius,
  isOnline = false,
  onClick,
  style = {},
  imageStyle = {},
  className = '',
  title,
}) => {
  const avatarSrc = src || getAvatarUrl(user);
  const altText = alt || user?.fullName || user?.username || 'User';
  const radius = borderRadius || (size >= 80 ? '24px' : size >= 44 ? '14px' : '12px');
  const dotSize = size >= 80 ? '16px' : size >= 44 ? '12px' : '9px';

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'inline-block',
        width: `${size}px`,
        height: `${size}px`,
        flexShrink: 0,
        cursor: onClick ? 'pointer' : 'inherit',
        ...style,
      }}
      title={title}
    >
      <img
        src={avatarSrc}
        alt={altText}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: radius,
          objectFit: 'cover',
          border: '1px solid var(--border)',
          display: 'block',
          ...imageStyle,
        }}
      />
      {isOnline && (
        <span
          className="online-dot"
          style={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            width: dotSize,
            height: dotSize,
          }}
        />
      )}
    </div>
  );
};

export default Avatar;
