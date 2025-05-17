// src/api/peopleApi.js
import api from './authApi';

export const createPerson = async (personData) => {
  const response = await api.post('/people', personData);
  return response.data;
};

export const getPeople = async (search = '', sortBy = 'name', sortOrder = 'ASC') => {
  const response = await api.get(`/people?search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
  return response.data;
};

export const getPerson = async (id) => {
  const response = await api.get(`/people/${id}`);
  return response.data;
};

export const updatePerson = async (id, personData) => {
  const response = await api.put(`/people/${id}`, personData);
  return response.data;
};

export const deletePerson = async (id) => {
  const response = await api.delete(`/people/${id}`);
  return response.data;
};

export const getPersonTransactions = async (id, sortBy = 'transactionDate', sortOrder = 'DESC') => {
  const response = await api.get(`/people/${id}/transactions?sortBy=${sortBy}&sortOrder=${sortOrder}`);
  return response.data;
};

export const getTopPeople = async (type = 'balance', limit = 5) => {
  const response = await api.get(`/people/top?type=${type}&limit=${limit}`);
  return response.data;
};