import axios from 'axios';

// Backend runs on a separate hosting service (e.g., Render / Railway / Fly.io).
// Set VITE_API_BASE_URL in Vercel project environment variables to the backend URL,
// e.g. https://interview-ai-backend.onrender.com/api
// In local development this is controlled by the .env file (VITE_API_BASE_URL=http://localhost:5001/api).
const rawApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

let API_BASE_URL = rawApiUrl;
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

// Request interceptor to attach Firebase ID Token for protected routes
apiClient.interceptors.request.use(async (config) => {
  if (config.url && config.url.startsWith('/')) {
    config.url = config.url.substring(1);
  }
  // Ensure baseURL ends with a trailing slash so relative paths append correctly
  if (config.baseURL && !config.baseURL.endsWith('/')) {
    config.baseURL += '/';
  }

  // Skip auto-attaching token for explicitly passed token routes
  const isAuthRoute = config.url === 'auth/register' || config.url === 'auth/login';

  if (!isAuthRoute && auth.currentUser) {
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
