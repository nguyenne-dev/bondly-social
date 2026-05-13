import { api } from './client';

export const chatApi = {
  getConversations: (options) => api.get('chat/conversations', options),
  getPartnerConversation: (partnerId, options) => api.get(`chat/conversations/partner/${partnerId}`, options),
  getMessages: (convId, limit = 100, cursor = null, options) => {
    let query = `limit=${limit}`;
    if (cursor) query += `&cursor=${encodeURIComponent(cursor)}`;
    return api.get(`chat/messages/${convId}?${query}`, options);
  },
  markAsRead: (convId, options) => api.put(`chat/messages/read/${convId}`, {}, options),
  deleteForMe: (msgId, options) => api.delete(`chat/messages/delete-for-me/${msgId}`, options),
};

export default chatApi;
