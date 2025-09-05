import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error);
    return Promise.reject(error);
  }
);

// Email API calls
export const emailAPI = {
  // Get all emails
  getEmails: (params = {}) => api.get('/emails', { params }),
  
  // Get single email
  getEmail: (id) => api.get(`/emails/${id}`),
  
  // Fetch new emails from email server
  fetchEmails: () => api.get('/emails/fetch'),
  
  // Update email (response, status)
  updateEmail: (id, data) => api.put(`/emails/${id}`, data),
  
  // Send reply
  sendReply: (id) => api.post(`/emails/${id}/send`),
  
  // Get analytics
  getAnalytics: () => api.get('/emails/analytics/stats'),
  
  // Bulk operations
  bulkUpdateStatus: (emailIds, status) => 
    api.post('/emails/bulk/status', { emailIds, status }),
};

export default api;
