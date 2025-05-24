// src/api/authApi.js - Fixed version
import axios from 'axios';
import { getToken, setToken, removeToken } from '../utils/auth';

// Environment-based API configuration
const getApiUrl = () => {
  // Check if we're in development
  if (process.env.NODE_ENV === 'local') {
    return process.env.REACT_APP_API_URL || 'http://localhost:5001';
  }

  // Production or other environments
  return process.env.REACT_APP_API_URL || 'https://finance-tracker-backend-k4e0.onrender.com';
};

const API_URL = getApiUrl();
const BASE_URL = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;

console.log('Environment:', process.env.NODE_ENV);
console.log('Using API URL:', BASE_URL);

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
  withCredentials: false, // Keep this false to avoid CORS issues
});

// Request interceptor - add token and logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);

    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors and token expiration
api.interceptors.response.use(
  (response) => {
    console.log(`Response received:`, {
      status: response.status,
      url: response.config.url,
      method: response.config.method
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });

    // Handle network errors
    if (!error.response) {
      console.error('Network Error - API might be down');
      return Promise.reject({
        ...error,
        message: 'Network error. Please check your connection and try again.'
      });
    }

    // Handle authentication errors
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const errorMessage = error.response.data?.error || '';

      if (errorMessage.includes('token') ||
          errorMessage.includes('log in') ||
          errorMessage.includes('authentication') ||
          errorMessage.includes('unauthorized')) {

        console.log('Authentication error detected, removing token and redirecting to login');
        removeToken();

        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Authentication services with better error handling
export const register = async (userData) => {
  try {
    console.log('Attempting to register user:', { email: userData.email });
    const response = await api.post('/auth/register', userData);
    console.log('Registration successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    console.log(`Attempting to login with email: ${email}`);
    const response = await api.post('/auth/login', { email, password });
    console.log('Login response received:', {
      success: !!response.data.token,
      user: response.data.user?.email
    });

    if (response.data.token) {
      setToken(response.data.token);
      console.log('Token saved successfully');
    }

    return response.data;
  } catch (error) {
    console.error('Login error details:', {
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
      url: error.config?.url
    });
    throw error;
  }
};

export const logout = () => {
  console.log('Logging out user');
  removeToken();
};

export const forgotPassword = async (email) => {
  try {
    console.log('Requesting password reset for:', email);
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    console.error('Forgot password error:', error);
    throw error;
  }
};

export const resetPassword = async (token, password) => {
  try {
    console.log('Attempting password reset with token');
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};

export const verifyEmail = async (token) => {
  try {
    console.log('Verifying email with token');
    const response = await api.get(`/auth/verify-email/${token}`);
    return response.data;
  } catch (error) {
    console.error('Email verification error:', error);
    throw error;
  }
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    console.log('Attempting to change password');
    const response = await api.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};

export const getProfile = async () => {
  try {
    console.log('Fetching user profile');
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

export const updateProfile = async (profileData) => {
  try {
    console.log('Updating user profile');
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

export default api;