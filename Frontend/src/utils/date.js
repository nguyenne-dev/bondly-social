/**
 * Định dạng thời gian sang định dạng tiếng Việt HH:mm
 * @param {string|number|Date} dateStr - Chuỗi thời gian hoặc đối tượng Date
 * @returns {string} Chuỗi giờ:phút định dạng vi-VN
 */
export function formatTime(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

/**
 * Trả về key ngày (YYYY-MM-DD) của một mốc thời gian.
 * Dùng để gom nhóm & hiển thị dải phân cách ngày.
 */
export function dayKey(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  } catch {
    return '';
  }
}

/**
 * Định dạng tên ngày cho dải phân cách (Hôm nay / Hôm qua / Thứ, ngày tháng).
 */
export function formatDayLabel(dateStr) {
  const key = dayKey(dateStr);
  if (!key) return '';

  const today = dayKey(new Date());
  const yesterday = dayKey(new Date(Date.now() - 86400000));

  if (key === today) return 'Hôm nay';
  if (key === yesterday) return 'Hôm qua';

  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
  } catch {
    return key;
  }
}
