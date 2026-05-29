const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://bondly-social.onrender.com/api';

export class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  getToken() {
    return localStorage.getItem('bondly_token') || '';
  }

  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}/${endpoint.replace(/^\//, '')}`;
    const isFormData = options.body instanceof FormData;
    const headers = this.getHeaders(options.headers);
    if (isFormData) {
      delete headers['Content-Type']; // Để trình duyệt tự tính toán multipart boundary
    }

    const config = {
      ...options,
      headers,
      credentials: 'include',
    };

    try {
      const response = await fetch(url, config);

      // Token hết hạn / không hợp lệ -> xóa phiên và thông báo cho app đăng xuất
      if (response.status === 401) {
        localStorage.removeItem('bondly_token');
        window.dispatchEvent(new Event('bondly_unauthorized'));
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = data?.message || data?.error || `HTTP Error ${response.status}`;
        const error = new Error(errorMsg);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  get(endpoint, options = {}) {
    const opts = typeof options === 'object' && !Array.isArray(options) ? options : { headers: options };
    return this.request(endpoint, { method: 'GET', ...opts });
  }

  post(endpoint, body = {}, options = {}) {
    const isFormData = body instanceof FormData;
    const opts = typeof options === 'object' && !Array.isArray(options) ? options : { headers: options };
    return this.request(endpoint, {
      method: 'POST',
      ...opts,
      body: isFormData ? body : JSON.stringify(body),
    });
  }

  put(endpoint, body = {}, options = {}) {
    const isFormData = body instanceof FormData;
    const opts = typeof options === 'object' && !Array.isArray(options) ? options : { headers: options };
    return this.request(endpoint, {
      method: 'PUT',
      ...opts,
      body: isFormData ? body : JSON.stringify(body),
    });
  }

  upload(endpoint, file, fieldName = 'file', extraData = {}, options = {}) {
    const formData = new FormData();
    formData.append(fieldName, file);
    Object.keys(extraData).forEach((key) => {
      formData.append(key, extraData[key]);
    });
    return this.post(endpoint, formData, options);
  }

  delete(endpoint, options = {}) {
    const opts = typeof options === 'object' && !Array.isArray(options) ? options : { headers: options };
    return this.request(endpoint, { method: 'DELETE', ...opts });
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
