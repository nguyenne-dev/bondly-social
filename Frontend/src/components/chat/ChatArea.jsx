import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { api } from '../../api/client';
import { ImageViewerModal } from '../modals/ImageViewerModal';
import { ConfirmModal } from '../modals/ConfirmModal';
import { 
  Send, 
  Image as ImageIcon, 
  Smile, 
  MoreVertical, 
  Check, 
  CheckCheck, 
  RotateCcw, 
  Trash2,
  ArrowLeft,
  Heart, 
  ThumbsUp, 
  Laugh, 
  Flame, 
  Info, 
  X, 
  Phone, 
  Video,
  Loader2
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const EMOJI_LIST = ['❤️', '👍', '😂', '🔥', '🎉', '😮', '😢', '👏', '🚀', '💯'];

export const ChatArea = ({
  conversation,
  messages,
  loadingMessages,
  onSendMessage,
  onRecallMessage,
  onDeleteMessageForMe,
  onReactMessage,
  onToggleProfile,
  onBack,
  isTyping,
}) => {
  const { user } = useAuth();
  const { isUserOnline, sendTypingSocket, sendStopTypingSocket, markAsReadSocket } = useSocket();
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [viewerImage, setViewerImage] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Confirm Modal state
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    cancelText: 'Hủy',
    confirmType: 'danger',
    onConfirm: () => {},
  });

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const partner = conversation?.participants?.find(
    (p) => (p._id || p.id) !== (user?._id || user?.id)
  );
  const partnerId = partner?._id || partner?.id;
  const isOnline = isUserOnline(partnerId);

  // Auto scroll to bottom on messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Mark as read when entering conversation
  useEffect(() => {
    if (conversation?._id && partnerId) {
      markAsReadSocket(conversation._id, partnerId);
    }
  }, [conversation?._id, messages.length]);

  // Typing event handler
  const handleInputChange = (e) => {
    setInputText(e.target.value);

    if (conversation?._id && partnerId) {
      sendTypingSocket(partnerId, conversation._id);

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendStopTypingSocket(partnerId, conversation._id);
      }, 2000);
    }
  };

  // Send message submit
  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim() && !selectedImage) return;

    onSendMessage({
      receiverId: partnerId,
      text: inputText.trim(),
      media: selectedImage
        ? {
            url: selectedImage,
            type: 'image',
            name: 'photo.png',
          }
        : null,
    });

    setInputText('');
    setSelectedImage(null);
    setShowEmojiPicker(false);
    if (conversation?._id && partnerId) {
      sendStopTypingSocket(partnerId, conversation._id);
    }
  };

  // Image upload handler directly to Cloudinary
  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setUploadingImage(true);
        const res = await api.upload('upload/image', file);
        if (res?.data?.url) {
          setSelectedImage(res.data.url);
        }
      } catch (err) {
        console.error('Lỗi khi tải ảnh lên Cloudinary:', err);
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleEmojiClick = (emoji) => {
    setInputText((prev) => prev + emoji);
  };

  if (!conversation) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-app)',
          color: 'var(--text-muted)',
          padding: '40px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '24px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
          }}
        >
          <Smile size={36} />
        </div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
          Chào mừng đến với <span className="gradient-text">Bondly</span>
        </h3>
        <p style={{ maxWidth: '420px', fontSize: '0.92rem', lineHeight: 1.6 }}>
          Chọn một cuộc trò chuyện từ thanh bên trái hoặc tìm kiếm bạn bè để bắt đầu trao đổi tin nhắn tức thì.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-app)',
        height: '100%',
        position: 'relative',
      }}
    >
      {/* 1. Chat Header */}
      <div
        style={{
          height: '72px',
          minHeight: '72px',
          maxHeight: '72px',
          padding: '0 24px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
          boxSizing: 'border-box',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onBack && (
            <button
              onClick={onBack}
              className="btn-icon mobile-back-btn"
              style={{ width: '38px', height: '38px', borderRadius: '12px', flexShrink: 0 }}
              title="Quay lại danh sách hội thoại"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <div
            onClick={() => {
              const avt = partner?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner?.fullName || partner?.username || 'User')}&background=06b6d4&color=fff`;
              setViewerImage(avt);
              setIsViewerOpen(true);
            }}
            style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}
            title="Bấm để xem ảnh đại diện phóng to"
          >
            <img
              src={
                partner?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  partner?.fullName || partner?.username || 'User'
                )}&background=06b6d4&color=fff`
              }
              alt={partner?.fullName}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                objectFit: 'cover',
                border: '1px solid var(--border)',
                display: 'block',
                transition: 'opacity 0.2s ease',
              }}
            />
            {isOnline && (
              <span
                className="online-dot"
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '12px',
                  height: '12px',
                }}
              />
            )}
          </div>

          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              {partner?.fullName || partner?.username}
            </h3>
            <p
              style={{
                fontSize: '0.8rem',
                color: isTyping
                  ? 'var(--primary)'
                  : isOnline
                  ? 'var(--online)'
                  : 'var(--text-subtle)',
                fontWeight: 600,
              }}
            >
              {isTyping ? 'Đang soạn tin nhắn...' : isOnline ? 'Đang hoạt động' : 'Offline'}
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onToggleProfile}
            className="btn-icon"
            style={{ width: '36px', height: '36px' }}
            title="Thông tin chi tiết"
          >
            <Info size={18} />
          </button>
        </div>
      </div>

      {/* 2. Messages List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {loadingMessages ? (
          <LoadingSpinner message="Đang tải lịch sử trò chuyện..." />
        ) : messages.length === 0 ? (
          <div
            className="animate-fade-in"
            style={{
              textAlign: 'center',
              margin: 'auto',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '30px',
            }}
          >
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <img
                src={
                  partner?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    partner?.fullName || partner?.username || 'User'
                  )}&background=06b6d4&color=fff`
                }
                alt={partner?.fullName}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '24px',
                  objectFit: 'cover',
                  border: '2px solid var(--border)',
                  boxShadow: '0 8px 24px rgba(6, 182, 212, 0.2)',
                }}
              />
              {isOnline && (
                <span
                  className="online-dot"
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '16px',
                    height: '16px',
                  }}
                />
              )}
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
              {partner?.fullName || partner?.username}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '360px', marginBottom: '16px' }}>
              {partner?.bio || 'Chưa có lời giới thiệu cá nhân'}
            </p>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                fontSize: '0.85rem',
                color: 'var(--primary)',
                fontWeight: 600,
              }}
            >
              <span>👋 Hãy gửi tin nhắn đầu tiên để bắt đầu trò chuyện!</span>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe =
              (msg.senderId?._id || msg.senderId?.id || msg.senderId) ===
              (user?._id || user?.id);

            const isRecalled = msg.isRecalled;
            const isHovered = hoveredMessageId === msg._id;

            return (
              <div
                key={msg._id}
                onMouseEnter={() => setHoveredMessageId(msg._id)}
                onMouseLeave={() => setHoveredMessageId(null)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexDirection: isMe ? 'row-reverse' : 'row',
                    maxWidth: '75%',
                  }}
                >
                  {/* Message Bubble */}
                  <div
                    style={{
                      padding: msg.media?.url ? '8px' : '12px 18px',
                      borderRadius: isMe
                        ? '18px 18px 4px 18px'
                        : '18px 18px 18px 4px',
                      background: isRecalled
                        ? 'var(--bg-subtle)'
                        : isMe
                        ? 'var(--msg-sent-bg)'
                        : 'var(--msg-received-bg)',
                      color: isRecalled
                        ? 'var(--text-subtle)'
                        : isMe
                        ? 'var(--msg-sent-color)'
                        : 'var(--msg-received-color)',
                      boxShadow: isMe ? '0 4px 14px rgba(6, 182, 212, 0.3)' : 'var(--shadow-sm)',
                      fontSize: '0.925rem',
                      lineHeight: 1.5,
                      wordBreak: 'break-word',
                      position: 'relative',
                    }}
                  >
                    {isRecalled ? (
                      <span style={{ fontStyle: 'italic', opacity: 0.8 }}>
                        Tin nhắn đã được thu hồi
                      </span>
                    ) : (
                      <>
                        {msg.media?.url && (
                          <img
                            src={msg.media.url}
                            alt="Attachment"
                            onClick={() => {
                              setViewerImage(msg.media.url);
                              setIsViewerOpen(true);
                            }}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '320px',
                              borderRadius: '12px',
                              display: 'block',
                              marginBottom: msg.text ? '8px' : '0',
                              objectFit: 'cover',
                              cursor: 'pointer',
                              transition: 'opacity 0.2s ease',
                            }}
                            title="Bấm để xem ảnh phóng to toàn màn hình"
                          />
                        )}
                        {msg.text && <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>}
                      </>
                    )}

                    {/* Reactions Floating Badge */}
                    {msg.reactions && msg.reactions.length > 0 && !isRecalled && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '-10px',
                          right: isMe ? '8px' : 'auto',
                          left: isMe ? 'auto' : '8px',
                          backgroundColor: 'var(--bg-surface)',
                          borderRadius: '12px',
                          padding: '2px 6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                          border: '1px solid var(--border)',
                          boxShadow: 'var(--shadow-sm)',
                          fontSize: '0.75rem',
                        }}
                      >
                        {Array.from(new Set(msg.reactions.map((r) => r.emoji))).map((emoji, idx) => (
                          <span key={idx}>{emoji}</span>
                        ))}
                        {msg.reactions.length > 1 && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                            {msg.reactions.length}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Hover Quick Action Buttons */}
                  {isHovered && !isRecalled && (
                    <div
                      className="animate-fade-in"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: 'var(--bg-surface)',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-md)',
                      }}
                    >
                      {/* Emoji quick react */}
                      {EMOJI_LIST.slice(0, 4).map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() =>
                            onReactMessage({
                              messageId: msg._id,
                              receiverId: partnerId,
                              emoji,
                              conversationId: conversation._id,
                            })
                          }
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            padding: '2px',
                            transition: 'transform 0.1s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.3)')}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                          {emoji}
                        </button>
                      ))}

                      {/* Delete for me button (Xóa một bên, không xóa DB thật) */}
                      <button
                        onClick={() => {
                          setConfirmConfig({
                            isOpen: true,
                            title: 'Xóa tin nhắn ở phía bạn?',
                            message: 'Tin nhắn này sẽ được ẩn ở màn hình của bạn. Người nhận vẫn xem được và bản ghi vẫn được lưu trữ an toàn.',
                            confirmText: 'Xóa một bên',
                            confirmType: 'danger',
                            onConfirm: () => onDeleteMessageForMe && onDeleteMessageForMe(msg._id),
                          });
                        }}
                        className="btn-icon"
                        style={{ width: '26px', height: '26px', color: 'var(--text-subtle)' }}
                        title="Xóa ở phía bạn"
                      >
                        <Trash2 size={13} />
                      </button>

                      {/* Recall button if mine (Thu hồi với tất cả mọi người) */}
                      {isMe && (
                        <button
                          onClick={() => {
                            setConfirmConfig({
                              isOpen: true,
                              title: 'Thu hồi tin nhắn với mọi người?',
                              message: 'Tin nhắn sẽ được đánh dấu đã thu hồi (xóa toàn bộ) với tất cả thành viên trong cuộc trò chuyện.',
                              confirmText: 'Thu hồi tất cả',
                              confirmType: 'danger',
                              onConfirm: () =>
                                onRecallMessage({
                                  messageId: msg._id,
                                  receiverId: partnerId,
                                  conversationId: conversation._id,
                                }),
                            });
                          }}
                          className="btn-icon"
                          style={{ width: '26px', height: '26px', color: 'var(--danger)' }}
                          title="Thu hồi tin nhắn với tất cả"
                        >
                          <RotateCcw size={13} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Timestamp & Read Status */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.72rem',
                    color: 'var(--text-subtle)',
                    marginTop: '4px',
                  }}
                >
                  <span>
                    {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {isMe && !isRecalled && (
                    <span>
                      {msg.isRead ? (
                        <CheckCheck size={14} color="var(--primary)" />
                      ) : (
                        <Check size={14} />
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Typing Indicator Banner */}
      {isTyping && (
        <div
          className="animate-fade-in"
          style={{
            padding: '4px 28px',
            fontSize: '0.8rem',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span className="animate-pulse">● ● ●</span>
          <span>{partner?.fullName || partner?.username} đang gõ...</span>
        </div>
      )}

      {/* 4. Input Area */}
      <div
        style={{
          padding: '16px 24px',
          backgroundColor: 'var(--bg-surface)',
          borderTop: '1px solid var(--border)',
          position: 'relative',
        }}
      >
        {/* Selected Image Preview */}
        {selectedImage && (
          <div
            style={{
              position: 'relative',
              display: 'inline-block',
              marginBottom: '10px',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '2px solid var(--primary)',
            }}
          >
            <img
              src={selectedImage}
              alt="Preview"
              style={{ width: '80px', height: '80px', objectFit: 'cover' }}
            />
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                background: 'rgba(0,0,0,0.7)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Quick Emoji Picker Floating Panel */}
        {showEmojiPicker && (
          <div
            className="glass-card animate-fade-in"
            style={{
              position: 'absolute',
              bottom: '80px',
              left: '24px',
              padding: '12px',
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
              zIndex: 100,
              backgroundColor: 'var(--bg-surface)',
            }}
          >
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.4rem',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '8px',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Input Form */}
        <form
          onSubmit={handleSend}
          style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            style={{ display: 'none' }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn-icon"
            title="Đính kèm hình ảnh"
          >
            <ImageIcon size={18} />
          </button>

          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="btn-icon"
            title="Thả Emoji"
          >
            <Smile size={18} />
          </button>

          <textarea
            ref={textareaRef}
            rows={1}
            className="form-input"
            placeholder="Nhập tin nhắn... (Shift + Enter để xuống dòng)"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              handleInputChange(e);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
                if (textareaRef.current) textareaRef.current.style.height = '44px';
              }
            }}
            style={{
              minHeight: '44px',
              maxHeight: '120px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              resize: 'none',
              overflowY: 'auto',
              lineHeight: 1.45,
              fontSize: '0.92rem',
            }}
          />

          <button
            type="submit"
            className="btn btn-primary"
            style={{ height: '44px', padding: '0 20px' }}
            disabled={!inputText.trim() && !selectedImage}
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* Fullscreen Image Viewer Modal */}
      <ImageViewerModal
        isOpen={isViewerOpen}
        imageUrl={viewerImage}
        altText="Ảnh chi tiết"
        onClose={() => setIsViewerOpen(false)}
      />

      {/* Confirmation Modal for Delete & Recall */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        cancelText={confirmConfig.cancelText}
        confirmType={confirmConfig.confirmType}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default ChatArea;
