import React, { useState, useRef } from 'react';
import { Send, Image as ImageIcon, Smile, X } from 'lucide-react';
import { uploadApi } from '../../api/upload.api';
import { EMOJI_LIST } from '../../utils/constants';

export const ChatInput = ({
  onSendMessage,
  partnerId,
  conversationId,
  sendTypingSocket,
  sendStopTypingSocket,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Typing event handler
  const handleInputChange = (e) => {
    setInputText(e.target.value);

    if (conversationId && partnerId && sendTypingSocket) {
      sendTypingSocket(partnerId, conversationId);

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (sendStopTypingSocket) {
          sendStopTypingSocket(partnerId, conversationId);
        }
      }, 2000);
    }
  };

  // Send message submit
  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim() && !selectedImage) return;

    if (onSendMessage) {
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
    }

    setInputText('');
    setSelectedImage(null);
    setShowEmojiPicker(false);
    if (textareaRef.current) textareaRef.current.style.height = '44px';

    if (conversationId && partnerId && sendStopTypingSocket) {
      sendStopTypingSocket(partnerId, conversationId);
    }
  };

  // Image upload handler directly to Cloudinary
  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setUploadingImage(true);
        const res = await uploadApi.uploadImage(file);
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

  return (
    <div className="chat-input-bar">
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
        <div className="chat-emoji-picker-panel glass-card animate-fade-in">
          {EMOJI_LIST.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleEmojiClick(emoji)}
              className="chat-emoji-btn"
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
          disabled={uploadingImage}
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
            handleInputChange(e);
            e.target.style.height = 'auto';
            e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
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
          disabled={(!inputText.trim() && !selectedImage) || uploadingImage}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
