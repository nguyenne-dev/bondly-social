import { useState, useCallback, useEffect } from 'react';
import { friendApi } from '../api/friend.api';
import { useToast } from '../components/common/Toast';

export const useFriends = () => {
  const { addToast } = useToast();
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Fetch Friend Requests & Friends List
  const fetchFriendRequests = useCallback(async () => {
    try {
      setLoadingRequests(true);
      const [incoming, sent, friends] = await Promise.all([
        friendApi.getReceived().catch(() => ({ data: [] })),
        friendApi.getSent().catch(() => ({ data: [] })),
        friendApi.getFriends().catch(() => ({ data: [] })),
      ]);

      setIncomingRequests(Array.isArray(incoming?.data) ? incoming.data : []);
      setSentRequests(Array.isArray(sent?.data) ? sent.data : []);
      setFriendsList(Array.isArray(friends?.data) ? friends.data : []);
    } catch (err) {
      console.error('Lỗi tải danh sách bạn bè / lời mời:', err);
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  // Accept Friend Request
  const handleAcceptRequest = useCallback(async (requestId) => {
    try {
      await friendApi.accept(requestId);
      addToast('Đã chấp nhận lời mời kết bạn!', 'success');
      fetchFriendRequests();
    } catch (err) {
      addToast(err.message || 'Lỗi khi chấp nhận kết bạn', 'error');
    }
  }, [addToast, fetchFriendRequests]);

  // Reject Friend Request
  const handleRejectRequest = useCallback(async (requestId) => {
    try {
      await friendApi.reject(requestId);
      addToast('Đã từ chối lời mời', 'info');
      fetchFriendRequests();
    } catch (err) {
      addToast(err.message || 'Lỗi khi từ chối', 'error');
    }
  }, [addToast, fetchFriendRequests]);

  // Cancel Sent Request
  const handleCancelRequest = useCallback(async (requestId) => {
    try {
      await friendApi.cancel(requestId);
      addToast('Đã hủy lời mời kết bạn', 'info');
      fetchFriendRequests();
    } catch (err) {
      addToast(err.message || 'Lỗi khi hủy lời mời', 'error');
    }
  }, [addToast, fetchFriendRequests]);

  // Unfriend execution
  const executeUnfriend = useCallback(async (friendId) => {
    try {
      await friendApi.unfriend(friendId);
      addToast('Đã hủy kết bạn', 'info');
      fetchFriendRequests();
      return true;
    } catch (err) {
      addToast(err.message || 'Lỗi khi hủy kết bạn', 'error');
      return false;
    }
  }, [addToast, fetchFriendRequests]);

  // Gửi lời mời kết bạn (dùng chung ở nhiều nơi: drawer, chat...)
  const handleSendFriendRequest = useCallback(async (receiverId) => {
    try {
      await friendApi.send(receiverId);
      addToast('Đã gửi lời mời kết bạn!', 'success');
      fetchFriendRequests();
      return true;
    } catch (err) {
      addToast(err.message || 'Không thể gửi lời mời kết bạn', 'error');
      return false;
    }
  }, [addToast, fetchFriendRequests]);

  useEffect(() => {
    fetchFriendRequests();
  }, [fetchFriendRequests]);

  return {
    incomingRequests,
    sentRequests,
    friendsList,
    loadingRequests,
    fetchFriendRequests,
    handleAcceptRequest,
    handleRejectRequest,
    handleCancelRequest,
    handleSendFriendRequest,
    executeUnfriend,
  };
};

export default useFriends;
