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
