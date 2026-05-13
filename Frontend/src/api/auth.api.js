import { api } from './client';

export const authApi = {
  login: (credentials, options) => api.post('auth/login', credentials, options),
  register: (userData, options) => api.post('auth/register', userData, options),
  verifyOtp: (payload, options) => api.post('auth/verify-otp', payload, options),
};

export default authApi;
