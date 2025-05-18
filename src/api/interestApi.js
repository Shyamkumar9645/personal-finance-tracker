// src/api/interestApi.js
import api from './authApi';

export const getTransactionInterest = async (transactionId) => {
  const response = await api.get(`/interest/transaction/${transactionId}`);
  return response.data;
};

export const updateTransactionInterest = async (transactionId, interestSettings) => {
  const response = await api.put(`/interest/transaction/${transactionId}`, interestSettings);
  return response.data;
};

export const getInterestSummary = async (personId) => {
  let url = '/interest/summary';
  if (personId) {
    url += `?personId=${personId}`;
  }
  const response = await api.get(url);
  return response.data;
};

export const getPersonInterestSummary = async () => {
  const response = await api.get('/interest/person-summary');
  return response.data;
};