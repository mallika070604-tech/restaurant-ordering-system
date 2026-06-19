import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const setAdminPin = (pin) => {
  if (pin) {
    api.defaults.headers.common['x-admin-pin'] = pin;
  } else {
    delete api.defaults.headers.common['x-admin-pin'];
  }
};

export const auth = {
  login: (pin) => api.post('/auth/login', { pin }),
};

export const tables = {
  list: () => api.get('/tables'),
  get: (number) => api.get(`/tables/${number}`),
  create: (data) => api.post('/tables', data),
  update: (id, data) => api.patch(`/tables/${id}`, data),
  remove: (id) => api.delete(`/tables/${id}`),
  qrUrl: (number) => `${API_URL}/tables/${number}/qr`,
};

export const menu = {
  list: (params) => api.get('/menu', { params }),
  create: (data) => api.post('/menu', data),
  update: (id, data) => api.put(`/menu/${id}`, data),
  toggleAvailability: (id, isAvailable) =>
    api.patch(`/menu/${id}/availability`, { isAvailable }),
  remove: (id) => api.delete(`/menu/${id}`),
};

export const orders = {
  list: (params) => api.get('/orders', { params }),
  active: () => api.get('/orders/active'),
  get: (id) => api.get(`/orders/${id}`),
  byTable: (tableNumber) => api.get(`/orders/table/${tableNumber}`),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  downloadInvoice: (orderNumber) =>
    `${API_URL}/orders/${orderNumber}/invoice/download`,
};

export const payments = {
  config: () => api.get('/payments/config'),
  createRazorpayOrder: (orderId) => api.post('/payments/create-order', { orderId }),
  verify: (data) => api.post('/payments/verify', data),
  markCashPaid: (orderId) => api.post(`/payments/cash/${orderId}`),
};

export const analytics = {
  summary: (period) => api.get('/analytics/summary', { params: { period } }),
};

export default api;
