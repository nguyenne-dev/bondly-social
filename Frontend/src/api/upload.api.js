import { api } from './client';

export const uploadApi = {
  uploadImage: (file, options) => api.upload('upload/image', file, 'file', {}, options),
  uploadAvatar: (file, options) => api.upload('upload/avatar', file, 'file', {}, options),
};

export default uploadApi;
