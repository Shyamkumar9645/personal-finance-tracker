// src/api/transactionsApi.js
// Update getTransactions function to handle stats correctly

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

  // Ensure we have the correct data structure and calculate stats if needed
  const transactions = response.data.transactions || [];

  // If response doesn't include stats, calculate them from transactions
  let stats = response.data.stats;
  if (!stats && Array.isArray(transactions)) {
    let totalReceived = 0;
    let totalGiven = 0;

    transactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount || 0);
      if (transaction.isMoneyReceived) {
        totalReceived += amount;
      } else {
        totalGiven += amount;
      }
    });

    stats = {
      totalReceived,
      totalGiven,
      balance: totalReceived - totalGiven,
      transactionCount: transactions.length
    };
  }

  return {
    transactions,
    stats
  };
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
  try {
    const response = await api.get('/transactions/dashboard');

    // Ensure we have the expected data structure
    const stats = response.data.stats || {};

    // Process topGivers and topReceivers if available
    if (stats.topGivers && Array.isArray(stats.topGivers)) {
      stats.topCreditors = stats.topGivers.map(item => ({
        id: item.personId,
        name: item.Person?.name || 'Unknown',
        balance: parseFloat(item.total || 0)
      }));
    } else {
      stats.topCreditors = [];
    }

    if (stats.topReceivers && Array.isArray(stats.topReceivers)) {
      stats.topDebtors = stats.topReceivers.map(item => ({
        id: item.personId,
        name: item.Person?.name || 'Unknown',
        balance: -parseFloat(item.total || 0) // Negative for debtors
      }));
    } else {
      stats.topDebtors = [];
    }

    // Process transactionsByMonth if available
    if (stats.transactionsByMonth && Array.isArray(stats.transactionsByMonth)) {
      // Group by month and isMoneyReceived
      const monthData = {};

      stats.transactionsByMonth.forEach(item => {
        const date = new Date(item.month);
        const monthKey = date.toISOString().split('T')[0].substring(0, 7); // YYYY-MM format

        if (!monthData[monthKey]) {
          monthData[monthKey] = {
            month: monthKey,
            monthName: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
            shortMonth: date.toLocaleDateString('en-US', { month: 'short' }),
            received: 0,
            given: 0
          };
        }

        // Add amount to the appropriate category
        if (item.isMoneyReceived) {
          monthData[monthKey].received += parseFloat(item.total || 0);
        } else {
          monthData[monthKey].given += parseFloat(item.total || 0);
        }
      });

      // Sort by month and add to stats
      stats.processedMonthlyData = Object.values(monthData)
        .sort((a, b) => a.month.localeCompare(b.month))
        .map(item => ({
          ...item,
          net: item.received - item.given
        }));
    }

    return { stats };
  } catch (err) {
    console.error('Error getting dashboard stats:', err);
    throw err;
  }
};

export const getPersonStats = async (personId) => {
  try {
    const response = await api.get(`/transactions/person/${personId}/stats`);
    const stats = response.data.stats || {};

    // Process transactionsByMonth similarly to getDashboardStats
    if (stats.transactionsByMonth && Array.isArray(stats.transactionsByMonth)) {
      const monthData = {};

      stats.transactionsByMonth.forEach(item => {
        const date = new Date(item.month);
        const monthKey = date.toISOString().split('T')[0].substring(0, 7);

        if (!monthData[monthKey]) {
          monthData[monthKey] = {
            month: monthKey,
            monthName: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
            shortMonth: date.toLocaleDateString('en-US', { month: 'short' }),
            received: 0,
            given: 0
          };
        }

        if (item.isMoneyReceived) {
          monthData[monthKey].received += parseFloat(item.total || 0);
        } else {
          monthData[monthKey].given += parseFloat(item.total || 0);
        }
      });

      stats.processedMonthlyData = Object.values(monthData)
        .sort((a, b) => a.month.localeCompare(b.month))
        .map(item => ({
          ...item,
          net: item.received - item.given
        }));
    }

    return { stats };
  } catch (err) {
    console.error('Error getting person stats:', err);
    throw err;
  }
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