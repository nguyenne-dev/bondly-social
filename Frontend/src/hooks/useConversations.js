import { useState, useCallback, useEffect } from 'react';
import { chatApi } from '../api/chat.api';
import { useToast } from '../components/common/Toast';

export const useConversations = () => {
  const { addToast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Conversations List
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await chatApi.getConversations();
      const data = Array.isArray(res?.data) ? res.data : [];
      setConversations(data);
      return data;
    } catch (err) {
      console.error('Lỗi khi tải danh sách hội thoại:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Start chat with user directly (Lazy draft conversation)
  const handleStartChatWithUser = useCallback(async (partnerId) => {
    try {
      // 1. Kiểm tra nếu đã có cuộc hội thoại trong danh sách
      const existing = conversations.find((c) =>
        c.participants?.some((p) => (p._id || p.id) === partnerId)
      );

      if (existing) {
        setActiveConversation(existing);
        return existing;
      }

      // 2. Lấy thông tin partner (hoặc draft conversation từ server)
      const res = await chatApi.getPartnerConversation(partnerId);
      if (res?.data) {
        setActiveConversation(res.data);
        return res.data;
      }
    } catch (err) {
      addToast('Không thể mở cuộc trò chuyện', 'error');
    }
    return null;
  }, [conversations, addToast]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    setConversations,
    activeConversation,
    setActiveConversation,
    loading,
    fetchConversations,
    handleStartChatWithUser,
  };
};

export default useConversations;
