import { api } from './client';

export const userApi = {
  getProfile: (options) => api.get('user/profile', options),
  updateProfile: (profileData, options) => api.put('user/profile', profileData, options),
  changePassword: (passwordData, options) => api.post('user/me/change-pass', passwordData, options),
  searchUsers: (query, options) => api.get(`user/search?q=${encodeURIComponent(query)}`, options),
  getAllUsers: (options) => api.get('user/all', options),
  getUserById: (userId, options) => api.get(`user/${userId}`, options),
};

export default userApi;
