import axios from 'axios';

let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Normalize the base URL to ensure it always ends with /api
if (!API_BASE_URL.endsWith('/api') && !API_BASE_URL.endsWith('/api/')) {
  API_BASE_URL = API_BASE_URL.replace(/\/$/, '') + '/api';
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

import { auth } from '../config/firebase';

// Request interceptor to attach Firebase ID Token
apiClient.interceptors.request.use(async (config) => {
  if (config.url === '/auth/register' || config.url === 'auth/register') {
    console.log('[Auth Debug] apiClient request interceptor running for:', config.url);
    console.log('[Auth Debug] config.data type:', typeof config.data);
    if (config.data && typeof config.data === 'object') {
      console.log('[Auth Debug] config.data keys:', Object.keys(config.data));
    }
  }

  if (config.url && config.url.startsWith('/')) {
    config.url = config.url.substring(1);
  }
  // Ensure baseURL ends with a trailing slash so relative paths append correctly
  if (config.baseURL && !config.baseURL.endsWith('/')) {
    config.baseURL += '/';
  }

  if (auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error('Failed to get Firebase token', error);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to normalize errors or handle generic 401s if needed
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.message === 'Network Error') {
      return Promise.reject(new Error('Network Error - Cannot reach backend (Check CORS, internet connection, or server status)'));
    }
    // Normalizing error messages
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);
