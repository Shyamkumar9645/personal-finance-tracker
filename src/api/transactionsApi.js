// src/api/transactionsApi.js
import api from './authApi';

export const createTransaction = async (transactionData) => {
  const response = await api.post('/transactions', transactionData);
  return response.data;
};

export const getTransactions = async (params = {}) => {
  const {
    sortBy = 'transactionDate',
    sortOrder = 'DESC',
    personId = '',
    search = '',
    startDate = '',
    endDate = '',
    isMoneyReceived = '',
    category = '',
    isSettled = ''
  } = params;

  const queryParams = new URLSearchParams();
  if (sortBy) queryParams.append('sortBy', sortBy);
  if (sortOrder) queryParams.append('sortOrder', sortOrder);
  if (personId) queryParams.append('personId', personId);
  if (search) queryParams.append('search', search);
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (isMoneyReceived !== '') queryParams.append('isMoneyReceived', isMoneyReceived);
  if (category) queryParams.append('category', category);
  if (isSettled !== '') queryParams.append('isSettled', isSettled);

  const response = await api.get(`/transactions?${queryParams.toString()}`);
  return response.data;
};

export const getTransaction = async (id) => {
  const response = await api.get(`/transactions/${id}`);
  return response.data;
};

export const updateTransaction = async (id, transactionData) => {
  const response = await api.put(`/transactions/${id}`, transactionData);
  return response.data;
};

export const deleteTransaction = async (id) => {
  const response = await api.delete(`/transactions/${id}`);
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get('/transactions/dashboard');
  return response.data;
};

export const getPersonStats = async (personId) => {
  const response = await api.get(`/transactions/person/${personId}/stats`);
  return response.data;
};

export const exportTransactions = (personId = '') => {
  const queryParam = personId ? `?personId=${personId}` : '';
  const token = localStorage.getItem('token');

  // Create a link and trigger download
  const link = document.createElement('a');
  link.href = `${api.defaults.baseURL}/transactions/export${queryParam}`;
  link.setAttribute('download', personId ? `transactions_person_${personId}.csv` : 'all_transactions.csv');

  // Set authorization header
  const headers = new Headers();
  headers.append('Authorization', `Bearer ${token}`);

  // Make a fetch request with authorization
  fetch(link.href, { headers })
    .then(response => response.blob())
    .then(blob => {
      link.href = URL.createObjectURL(blob);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch(error => {
      console.error('Error exporting transactions:', error);
    });
};