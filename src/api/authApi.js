// src/api/authApi.js - Simple Fix

import axios from 'axios';
import { getToken, setToken, removeToken } from '../utils/auth';

// API URL with correct prefix
const API_URL = process.env.REACT_APP_API_URL || 'https://backend1223.netlify.app';
const BASE_URL = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;

console.log('Using API URL:', BASE_URL);

// Create a basic API client WITHOUT withCredentials
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // IMPORTANT: Disable this to avoid CORS issues
  withCredentials: false,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);

    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (error.response.data?.error &&
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

// Authentication services
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
    console.log(`Attempting to login with email: ${email}`);
    const response = await api.post('/auth/login', { email, password });
    console.log('Login response:', response.data);
    if (response.data.token) {
      setToken(response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Login error details:', error);
    throw error;
  }
};

export const logout = () => {
  removeToken();
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (token, password) => {
  try {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyEmail = async (token) => {
  try {
    const response = await api.get(`/auth/verify-email/${token}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;