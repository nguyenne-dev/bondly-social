import React from 'react';

export const TypingIndicator = ({ partnerName }) => {
  return (
    <div className="typing-indicator-banner animate-fade-in">
      <span className="animate-pulse">● ● ●</span>
      <span>{partnerName || 'Đối phương'} đang gõ...</span>
    </div>
  );
};

export default TypingIndicator;
