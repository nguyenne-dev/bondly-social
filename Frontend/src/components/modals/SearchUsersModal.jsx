import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Search, UserPlus, MessageSquare, Check, Loader2 } from 'lucide-react';
import { userApi } from '../../api/user.api';
import { friendApi } from '../../api/friend.api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import Avatar from '../common/Avatar';

export const SearchUsersModal = ({
  isOpen,
  onClose,
  onStartChatWithUser,
  friendsList = [],
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sentMap, setSentMap] = useState({});

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      setSearching(true);
      const res = await userApi.searchUsers(searchTerm.trim()).catch(async () => {
        // Fallback to get all users if search route differs
        return await userApi.getAllUsers();
      });

      const usersList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      // Filter out myself
      const filtered = usersList.filter(
        (u) => (u._id || u.id) !== (user?._id || user?.id)
      );
      setSearchResults(filtered);
    } catch (err) {
      console.error('Lỗi tìm kiếm người dùng:', err);
      addToast('Không tìm thấy người dùng phù hợp', 'info');
    } finally {
      setSearching(false);
    }
  };

  const handleSendFriendRequest = async (targetId) => {
    try {
      await friendApi.send(targetId);
      setSentMap((prev) => ({ ...prev, [targetId]: true }));
      addToast('Đã gửi lời mời kết bạn!', 'success');
    } catch (err) {
      addToast(err.message || 'Không thể gửi lời mời kết bạn', 'error');
    }
  };

  const isFriend = (targetId) => {
    return friendsList.some((f) => (f._id || f.id) === targetId);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tìm Kiếm Bạn Bè Mới" maxWidth="520px">
      {/* Search Input */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '14px',
              top: '14px',
              color: 'var(--text-subtle)',
            }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '38px' }}
            placeholder="Nhập tên, username hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={searching}>
          {searching ? <Loader2 size={16} className="animate-pulse" /> : 'Tìm kiếm'}
        </button>
      </form>

      {/* Results */}
      <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {searchResults.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '0.9rem' }}>
              {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Nhập từ khóa để bắt đầu tìm kiếm'}
            </p>
          </div>
        ) : (
          searchResults.map((u) => {
            const uid = u._id || u.id;
            const alreadyFriend = isFriend(uid);
            const isSent = sentMap[uid];

            return (
              <div
                key={uid}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Avatar user={u} size={42} />
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700 }}>{u.fullName || u.username}</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>@{u.username}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      onStartChatWithUser(uid);
                      onClose();
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    title="Mở cuộc trò chuyện"
                  >
                    <MessageSquare size={14} /> Nhắn tin
                  </button>

                  {!alreadyFriend && (
                    <button
                      onClick={() => handleSendFriendRequest(uid)}
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      disabled={isSent}
                    >
                      {isSent ? (
                        <>
                          <Check size={14} /> Đã gửi
                        </>
                      ) : (
                        <>
                          <UserPlus size={14} /> Kết bạn
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
};

export default SearchUsersModal;
