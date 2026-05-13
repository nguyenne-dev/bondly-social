import { api } from './client';

export const friendApi = {
  getReceived: (options) => api.get('friend-request/received', options),
  getSent: (options) => api.get('friend-request/sent', options),
  getFriends: (options) => api.get('friend-request/friends', options),
  send: (receiverId, options) => api.post('friend-request/send', { receiverId }, options),
  accept: (requestId, options) => api.put(`friend-request/accept/${requestId}`, {}, options),
  reject: (requestId, options) => api.put(`friend-request/reject/${requestId}`, {}, options),
  cancel: (requestId, options) => api.delete(`friend-request/cancel/${requestId}`, options),
  unfriend: (friendId, options) => api.delete(`friend-request/unfriend/${friendId}`, options),
};

export default friendApi;
