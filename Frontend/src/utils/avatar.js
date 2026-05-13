/**
 * Trả về URL avatar hợp lệ của user, nếu chưa có thì sinh ảnh fallback từ ui-avatars.com
 * @param {Object|string} user - Đối tượng user hoặc URL chuỗi
 * @returns {string} URL avatar
 */
export function getAvatarUrl(user) {
  if (!user) {
    return 'https://ui-avatars.com/api/?name=User&background=06b6d4&color=fff';
  }

  // Trường hợp truyền thẳng chuỗi URL
  if (typeof user === 'string') {
    return user || 'https://ui-avatars.com/api/?name=User&background=06b6d4&color=fff';
  }

  // Trường hợp user object có avatar hợp lệ
  if (user.avatar && typeof user.avatar === 'string' && user.avatar.trim().length > 0) {
    return user.avatar;
  }

  // Fallback sinh theo fullName hoặc username
  const displayName = user.fullName || user.username || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=06b6d4&color=fff`;
}
