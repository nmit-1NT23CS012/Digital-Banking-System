import apiClient from './apiClient';

export const authService = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  getProfile: () => apiClient.get('/auth/profile'),
  refresh: (refreshToken) => apiClient.post('/auth/refresh', { refreshToken }),
};

export const transactionService = {
  transfer: (data) => apiClient.post('/transactions/transfer', data),
  getHistory: (page = 1, limit = 10) => apiClient.get(`/transactions/history?page=${page}&limit=${limit}`),
  getBalance: () => apiClient.get('/transactions/balance'),
};

export const adminService = {
  getAllUsers: () => apiClient.get('/admin/users'),
  freezeAccount: (id) => apiClient.put(`/admin/freeze/${id}`),
  unfreezeAccount: (id) => apiClient.put(`/admin/unfreeze/${id}`),
  deleteUser: (id) => apiClient.delete(`/admin/user/${id}`),
  addFunds: (userId, amount) => apiClient.post('/admin/add-funds', { userId, amount }),
  getTransactions: (page = 1, limit = 10) => apiClient.get(`/admin/transactions?page=${page}&limit=${limit}`),
  getStats: () => apiClient.get('/admin/stats'),
};

export default {
  authService,
  transactionService,
  adminService,
};
