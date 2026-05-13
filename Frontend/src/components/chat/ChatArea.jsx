import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { ImageViewerModal } from '../modals/ImageViewerModal';
import { ConfirmModal } from '../modals/ConfirmModal';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import ChatEmptyState from './ChatEmptyState';
import { extractPartner } from '../../utils/partner';

export const ChatArea = ({
  conversation,
  messages,
  loadingMessages,
  onSendMessage,
  onRetryMessage,
  onRecallMessage,
  onDeleteMessageForMe,
  onReactMessage,
  onToggleProfile,
  onBack,
  isTyping,
}) => {
  const { user } = useAuth();
  const { isUserOnline, sendTypingSocket, sendStopTypingSocket, markAsReadSocket } = useSocket();
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

  const partner = extractPartner(conversation, user);
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

  if (!conversation) {
    return <ChatEmptyState />;
  }

  return (
    <div className="chat-container">
      {/* 1. Chat Header */}
      <ChatHeader
        partner={partner}
        isOnline={isOnline}
        isTyping={isTyping}
        onBack={onBack}
        onAvatarClick={(avt) => {
          setViewerImage(avt);
          setIsViewerOpen(true);
        }}
        onToggleProfile={onToggleProfile}
      />

      {/* 2. Messages List & Typing Indicator */}
      <MessageList
        messages={messages}
        loadingMessages={loadingMessages}
        user={user}
        partner={partner}
        partnerId={partnerId}
        conversationId={conversation?._id}
        isOnline={isOnline}
        isTyping={isTyping}
        messagesEndRef={messagesEndRef}
        onImageClick={(url) => {
          setViewerImage(url);
          setIsViewerOpen(true);
        }}
        onReactMessage={onReactMessage}
        onDeleteMessageForMe={onDeleteMessageForMe}
        onRecallMessage={onRecallMessage}
        onRetryMessage={onRetryMessage}
        setConfirmConfig={setConfirmConfig}
      />

      {/* 3. Input Area */}
      <ChatInput
        onSendMessage={onSendMessage}
        partnerId={partnerId}
        conversationId={conversation?._id}
        sendTypingSocket={sendTypingSocket}
        sendStopTypingSocket={sendStopTypingSocket}
      />

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
