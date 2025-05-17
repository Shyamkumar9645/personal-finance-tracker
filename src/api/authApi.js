// Updated API Client Configuration for Production
// Update your src/api/authApi.js

import axios from 'axios';
import { getToken, setToken, removeToken } from '../utils/auth';

// API URL with fallback
const API_URL = process.env.REACT_APP_API_URL || '/api';

console.log('Using API URL:', API_URL); // Debug logging

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add withCredentials for CORS with credentials
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle authentication errors and display more detailed errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed error information
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Authentication error handling
      if (error.response.data.error &&
          (error.response.data.error.includes('token') ||
           error.response.data.error.includes('log in') ||
           error.response.data.error.includes('authentication'))) {
        removeToken();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication service
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      setToken(response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Rest of your API functions...

export default api;