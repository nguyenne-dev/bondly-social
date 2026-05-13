import { useState, useCallback, useEffect } from 'react';
import { chatApi } from '../api/chat.api';
import { useToast } from '../components/common/Toast';
import { extractPartner } from '../utils/partner';

export const useChat = ({
  user,
  activeConversation,
  setActiveConversation,
  sendMessageSocket,
  recallMessageSocket,
  reactMessageSocket,
  fetchConversations,
}) => {
  const { addToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typingPartnerId, setTypingPartnerId] = useState(null);

  // Fetch Messages for active conversation
  const fetchMessages = useCallback(async (convId) => {
    if (!convId) return;
    try {
      setLoadingMessages(true);
      const res = await chatApi.getMessages(convId, 100);
      const msgList = res?.data?.messages || [];
      setMessages(msgList);
    } catch (err) {
      console.error('Lỗi tải tin nhắn:', err);
      addToast('Không thể tải lịch sử tin nhắn', 'error');
    } finally {
      setLoadingMessages(false);
    }
  }, [addToast]);

  // When active conversation changes, fetch its messages
  useEffect(() => {
    if (activeConversation?._id) {
      fetchMessages(activeConversation._id);
    } else {
      setMessages([]);
    }
  }, [activeConversation?._id, fetchMessages]);

  // Send Message handler with 4 distribution states: sending -> sent -> read / failed
  const handleSendMessage = useCallback(({ receiverId, text, media, tempIdToRetry = null }) => {
    const isDraft = activeConversation?.isDraft || activeConversation?._id?.startsWith('draft_');
    const convIdToSend = isDraft ? null : activeConversation?._id;

    const currentUserId = user?._id || user?.id;
    const tempId = tempIdToRetry || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`;

    // 1. Tạo tin nhắn đang gửi (status = 'sending')
    if (!tempIdToRetry) {
      const optimisticMsg = {
        _id: tempId,
        tempId,
        conversationId: convIdToSend,
        senderId: currentUserId,
        sender: user,
        receiverId,
        text: text?.trim() || '',
        media: media || null,
        createdAt: new Date().toISOString(),
        isRead: false,
        status: 'sending',
        reactions: [],
        deletedFor: [],
        deletedAll: false,
      };

      setMessages((prev) => [...prev, optimisticMsg]);
    } else {
      // Đang gửi lại tin nhắn bị lỗi
      setMessages((prev) =>
        prev.map((m) =>
          (m._id === tempId || m.tempId === tempId) ? { ...m, status: 'sending' } : m
        )
      );
    }

    // 2. Gửi qua Socket.IO tới server
    let isAcknowledged = false;
    const sendTimer = setTimeout(() => {
      if (!isAcknowledged) {
        setMessages((prev) =>
          prev.map((m) =>
            (m._id === tempId || m.tempId === tempId) ? { ...m, status: 'failed' } : m
          )
        );
      }
    }, 12000);

    sendMessageSocket(
      {
        receiverId,
        text,
        media,
        conversationId: convIdToSend,
      },
      (res) => {
        isAcknowledged = true;
        clearTimeout(sendTimer);

        if (res?.success && res.data?.message) {
          const serverMsg = {
            ...res.data.message,
            status: res.data.message.isRead ? 'read' : 'sent',
          };

          // Thay thế tin nhắn tạm bằng tin nhắn đã lưu trên server
          setMessages((prev) =>
            prev.map((m) => (m._id === tempId || m.tempId === tempId ? serverMsg : m))
          );

          // Nâng cấp từ draft conversation lên real conversation sau khi gửi tin nhắn đầu tiên
          if (isDraft && res.data.conversationId) {
            setActiveConversation((prev) => ({
              ...prev,
              _id: res.data.conversationId,
              isDraft: false,
            }));
          }
          if (fetchConversations) {
            fetchConversations();
          }
        } else {
          // Báo trạng thái gửi thất bại
          setMessages((prev) =>
            prev.map((m) =>
              (m._id === tempId || m.tempId === tempId) ? { ...m, status: 'failed' } : m
            )
          );
          addToast(res?.message || 'Gửi tin nhắn thất bại. Vui lòng thử lại!', 'error');
        }
      }
    );
  }, [activeConversation, user, sendMessageSocket, setActiveConversation, fetchConversations, addToast]);

  // Retry send message handler
  const handleRetryMessage = useCallback((failedMsg) => {
    const partner = extractPartner(activeConversation, user);
    const receiverId = failedMsg.receiverId || partner?._id || partner?.id;

    handleSendMessage({
      receiverId,
      text: failedMsg.text,
      media: failedMsg.media,
      tempIdToRetry: failedMsg._id || failedMsg.tempId,
    });
  }, [activeConversation, user, handleSendMessage]);

  // Recall Message handler
  const handleRecallMessage = useCallback(({ messageId, receiverId, conversationId }) => {
    recallMessageSocket({ messageId, receiverId, conversationId }, (res) => {
      if (res?.success) {
        addToast('Đã thu hồi tin nhắn', 'info');
      }
    });
  }, [recallMessageSocket, addToast]);

  // React Message handler
  const handleReactMessage = useCallback(({ messageId, receiverId, emoji, conversationId }) => {
    reactMessageSocket({ messageId, receiverId, emoji, conversationId });
  }, [reactMessageSocket]);

  // Delete message for me (soft delete)
  const handleDeleteMessageForMe = useCallback(async (messageId) => {
    try {
      await chatApi.deleteForMe(messageId);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      addToast('Đã xóa tin nhắn ở phía bạn', 'info');
    } catch (err) {
      console.error('Lỗi khi xóa tin nhắn:', err);
      addToast(err.message || 'Lỗi khi xóa tin nhắn', 'error');
    }
  }, [addToast]);

  return {
    messages,
    setMessages,
    loadingMessages,
    typingPartnerId,
    setTypingPartnerId,
    fetchMessages,
    handleSendMessage,
    handleRetryMessage,
    handleRecallMessage,
    handleReactMessage,
    handleDeleteMessageForMe,
  };
};

export default useChat;
