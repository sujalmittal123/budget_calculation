import axios from 'axios';

/**
 * Axios API Configuration
 *
 * In production, all /api/* requests are proxied through Vercel rewrites
 * to the Azure backend (same-origin, no CORS). In development, Vite proxy
 * handles the same thing.
 *
 * Auth is handled via X-Session-Id header (set in request interceptor).
 */

// Always use relative /api path — proxied by Vercel (prod) or Vite (dev)
const baseURL = '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - no longer adds Authorization header
api.interceptors.request.use(
  (config) => {
    // HTTPOnly cookies are automatically sent by the browser
    // But as fallback for cross-domain cookie issues, also send session ID in header
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      config.headers['X-Session-Id'] = sessionId;
      console.log('📤 Sending request with session ID:', sessionId.substring(0, 10) + '...');
    } else {
      console.warn('⚠️ No session ID found in localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ 401 Unauthorized - Session expired or invalid');
      console.log('Clearing session and redirecting to login...');
      localStorage.removeItem('sessionId');
      // Session expired or invalid, redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API - Simplified (Better-Auth handles most auth operations)
export const authAPI = {
  // These endpoints still exist for profile management
  updateProfile: (data) => api.put('/user/profile', data),
  getCurrentUser: () => api.get('/user/me'),
  // Note: login, register, and Google OAuth are now handled by Better-Auth endpoints
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

// Daily Notes API
export const dailyNotesAPI = {
  getAll: (params) => api.get('/daily-notes', { params }),
  getByDate: (date) => api.get(`/daily-notes/${date}`),
  create: (data) => api.post('/daily-notes', data),
  delete: (date) => api.delete(`/daily-notes/${date}`),
  getBurnRate: (params) => api.get('/daily-notes/stats/burn-rate', { params }),
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

// Recurring Transactions API
export const recurringAPI = {
  // CRUD operations
  getAll: (params) => api.get('/recurring', { params }),
  getById: (id) => api.get(`/recurring/${id}`),
  create: (data) => api.post('/recurring', data),
  update: (id, data) => api.put(`/recurring/${id}`, data),
  delete: (id) => api.delete(`/recurring/${id}`),
  pause: (id) => api.patch(`/recurring/${id}/pause`),
  resume: (id) => api.patch(`/recurring/${id}/resume`),
  
  // AI Detection
  detect: () => api.get('/recurring/detect'),
  approvePattern: (pattern) => api.post('/recurring/detect/approve', { pattern }),
  
  // Generation
  getUpcoming: (days = 30) => api.get('/recurring/upcoming', { params: { days } }),
  generateNow: (id) => api.post(`/recurring/${id}/generate`),
  getHistory: (id) => api.get(`/recurring/${id}/history`),
  
  // Batch operations
  batchApprove: (patterns) => api.post('/recurring/batch/approve', { patterns }),
  batchDelete: (ids) => api.delete('/recurring/batch/delete', { data: { ids } }),
};

export default api;
