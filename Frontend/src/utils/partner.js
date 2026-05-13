/**
 * Trích xuất thông tin bạn chat (partner) từ cuộc hội thoại (khác với current user)
 * @param {Object} conversation - Đối tượng cuộc hội thoại
 * @param {Object} currentUser - Đối tượng user hiện tại
 * @returns {Object|null} Partner user object
 */
export function extractPartner(conversation, currentUser) {
  if (!conversation?.participants || !Array.isArray(conversation.participants)) {
    return null;
  }

  const currentUserId = (currentUser?._id || currentUser?.id)?.toString();

  return (
    conversation.participants.find((p) => {
      const pId = (p?._id || p?.id)?.toString();
      return pId && pId !== currentUserId;
    }) || null
  );
}
