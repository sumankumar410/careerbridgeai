import axios from 'axios';

// Resolve API base URL: If VITE_API_URL is configured (e.g. deployed backend), use it; otherwise use Vite proxy '/api'
export const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || envUrl.trim() === '') return '/api';
  const cleaned = envUrl.trim().replace(/\/+$/, '');
  return cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
};

// Helper to resolve static files (resumes, avatars) hosted on the backend
export const getFileUrl = (filePath) => {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  const envUrl = import.meta.env.VITE_API_URL;
  const backendBase = envUrl ? envUrl.trim().replace(/\/api\/?$/, '').replace(/\/+$/, '') : '';
  return `${backendBase}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
};

const api = axios.create({
  baseURL: getBaseURL(),
});

// Request Interceptor: Automatically attach JWT Token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // CRITICAL: When sending FormData, delete Content-Type so browser sets multipart/form-data with boundary!
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
