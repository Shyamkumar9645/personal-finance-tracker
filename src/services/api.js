import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear local storage on auth error
      if (error.response.data.message.includes('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth services
export const login = async (email, password) => {
  try {
    const response = await api.post('/users/login', { email, password });
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const register = async (username, email, password) => {
  try {
    const response = await api.post('/users/register', { username, email, password });
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) return JSON.parse(userStr);
  return null;
};

// Transaction services
export const getTransactions = async () => {
  try {
    const response = await api.get('/transactions');
    return response.data.data.transactions;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const getTransactionsByPerson = async (personName) => {
  try {
    const response = await api.get(`/transactions/person/${encodeURIComponent(personName)}`);
    return response.data.data.transactions;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const getTransactionStats = async () => {
  try {
    const response = await api.get('/transactions/stats');
    return response.data.data.stats;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const getPersonSummary = async () => {
  try {
    const response = await api.get('/transactions/person-summary');
    return response.data.data.personSummary;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const createTransaction = async (transactionData) => {
  try {
    const response = await api.post('/transactions', transactionData);
    return response.data.data.transaction;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const updateTransaction = async (id, transactionData) => {
  try {
    const response = await api.put(`/transactions/${id}`, transactionData);
    return response.data.data.transaction;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const deleteTransaction = async (id) => {
  try {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export default api;