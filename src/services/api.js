import axios from 'axios';
import { 
  mockAuthAPI, 
  mockUserAPI, 
  mockCompanyAPI, 
  mockSubscriptionAPI, 
  mockAnalyticsAPI, 
  mockSettingsAPI 
} from './mockApi';

// Determine if we're using the mock API or a real backend
const USE_MOCK_API = false;

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = USE_MOCK_API
  ? mockAuthAPI
  : {
      login: (credentials) => api.post('/auth/login', credentials),
      signup: (userData) => api.post('/auth/signup', userData),
      verifyToken: () => api.get('/auth/verify'),
      forgotPassword: (data) => api.post('/auth/forgot-password', data),
      resetPassword: (data) => api.post('/auth/reset-password', data),
      verifyEmail: (data) => api.post('/auth/verify-email', data),
    };

// User API
export const userAPI = USE_MOCK_API
  ? mockUserAPI
  : {
      getUsers: () => api.get('/users'),
      createUser: (userData) => api.post('/users', userData),
      updateUser: (id, userData) => api.put(`/users/${id}`, userData),
      deleteUser: (id) => api.delete(`/users/${id}`),
      inviteUser: (data) => api.post('/users/invite', data),
    };

// Company API
export const companyAPI = USE_MOCK_API
  ? mockCompanyAPI
  : {
      getCompanies: () => api.get('/companies'),
      createCompany: (companyData) => api.post('/companies', companyData),
      updateCompany: (id, companyData) => api.put(`/companies/${id}`, companyData),
      deleteCompany: (id) => api.delete(`/companies/${id}`),
    };

// Subscription API
export const subscriptionAPI = USE_MOCK_API
  ? mockSubscriptionAPI
  : {
      getSubscription: () => api.get('/subscription'),
      createCheckoutSession: (priceId) => api.post('/subscription/create-checkout-session', { priceId }),
      cancelSubscription: () => api.post('/subscription/cancel'),
      getInvoices: () => api.get('/subscription/invoices'),
    };

// Analytics API
export const analyticsAPI = USE_MOCK_API
  ? mockAnalyticsAPI
  : {
      getDashboardStats: () => api.get('/analytics/dashboard'),
      getUserGrowth: () => api.get('/analytics/user-growth'),
      getRevenueStats: () => api.get('/analytics/revenue'),
      getCompanyStats: () => api.get('/analytics/companies'),
    };

// Settings API
export const settingsAPI = USE_MOCK_API
  ? mockSettingsAPI
  : {
      getSettings: () => api.get('/settings'),
      updateSettings: (settings) => api.put('/settings', settings),
    };

export default api;