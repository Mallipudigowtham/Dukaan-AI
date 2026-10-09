import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dukaanai_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('dukaanai_token');
      localStorage.removeItem('dukaanai_shop');
      window.dispatchEvent(new Event('dukaanai_unauthorized'));
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (phone, password, extra = {}) =>
    api.post('/auth/login', { phone, password, ...extra }),
  register: (data) => api.post('/auth/register', data),
};

export const shopAPI = {
  getProfile: () => api.get('/shop/me'),
  updateProfile: (data) => api.put('/shop/me', data),
  changePassword: (oldPassword, newPassword) =>
    api.post('/shop/change-password', { old_password: oldPassword, new_password: newPassword }),
  loadSamples: () => api.post('/shop/me/load-samples'),
  getStockHints: () => api.get('/stock-hints'),
};

export const parseAPI = {
  parseText: (text, language) => api.post('/parse/text', { text, language }),
  parsePhoto: (formData) =>
    api.post('/parse/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const transactionsAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  create: (data) => api.post('/transactions', data),
};

export const itemsAPI = {
  getAll: () => api.get('/items'),
  create: (data) => api.post('/items', data),
  update: (id, data) => api.put(`/items/${id}`, data),
  delete: (id) => api.delete(`/items/${id}`),
};

export const customersAPI = {
  getAll: () => api.get('/customers'),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  getHistory: (id) => api.get(`/customers/${id}/history`),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard'),
};

export const reminderAPI = {
  getReminder: (customerId, lang = 'en') => api.get(`/reminder/${customerId}?lang=${lang}`),
};

export default api;
