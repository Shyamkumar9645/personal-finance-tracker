// src/components/dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../../api/transactionsApi';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const { stats } = await getDashboardStats();
        setStats(stats);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Financial Dashboard</h1>
        <div className="space-x-4 mt-4 md:mt-0">
          <Link
            to="/transactions/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
          >
            Add Transaction
          </Link>
          <Link
            to="/people/new"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md"
          >
            Add Person
          </Link>
        </div>
      </div>

      {stats && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Current Balance</h3>
              <p className={`text-2xl font-bold ${
                stats.balance > 0
                  ? 'text-green-600'
                  : stats.balance < 0
                    ? 'text-red-600'
                    : 'text-gray-800'
              }`}>
                {formatCurrency(stats.balance)}
              </p>
            </div>

            <div className="bg-red-50 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Total Given</h3>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(-stats.totalGiven)}
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Total Received</h3>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalReceived)}
              </p>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Recent Transactions</h2>
              <Link
                to="/transactions"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </Link>
            </div>

            {stats.recentTransactions && stats.recentTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Person
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.transactionDate)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Link
                            to={`/people/${transaction.personId}`}
                            className="text-blue-600 hover:text-blue-900 hover:underline text-sm font-medium"
                          >
                            {transaction.Person?.name || 'Unknown'}
                          </Link>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.description || '-'}
                        </td>
                        <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium text-right ${
                          transaction.isMoneyReceived ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.isMoneyReceived ? '+' : '-'} {formatCurrency(Math.abs(transaction.amount))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic py-4 text-center">No recent transactions</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;