import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};

// Bank Accounts API
export const bankAccountsAPI = {
  getAll: () => api.get('/bank-accounts'),
  getOne: (id) => api.get(`/bank-accounts/${id}`),
  create: (data) => api.post('/bank-accounts', data),
  update: (id, data) => api.put(`/bank-accounts/${id}`, data),
  delete: (id) => api.delete(`/bank-accounts/${id}`),
  getTransactions: (id) => api.get(`/bank-accounts/${id}/transactions`),
};

// Transactions API
export const transactionsAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getOne: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  bulkDelete: (ids) => api.delete('/transactions/bulk', { data: { ids } }),
  importCSV: (formData) => api.post('/transactions/import-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Dashboard API
export const dashboardAPI = {
  getSummary: (params) => api.get('/dashboard/summary', { params }),
  getCategoryBreakdown: (params) => api.get('/dashboard/category-breakdown', { params }),
  getMonthlyTrend: () => api.get('/dashboard/monthly-trend'),
  getBankSummary: () => api.get('/dashboard/bank-summary'),
  getRecentTransactions: (limit) => api.get('/dashboard/recent-transactions', { params: { limit } }),
  getPaymentMethodBreakdown: (params) => api.get('/dashboard/payment-method-breakdown', { params }),
};

// Export API
export const exportAPI = {
  transactionsCSV: (params) => api.get('/export/transactions/csv', { 
    params,
    responseType: 'blob' 
  }),
  reportPDF: (params) => api.get('/export/report/pdf', { 
    params,
    responseType: 'blob' 
  }),
};

export default api;
