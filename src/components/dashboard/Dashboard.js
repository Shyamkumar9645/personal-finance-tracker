import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../../api/transactionsApi';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';
import InterestSummary from './InterestSummary';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('summary');

  // Replace this with your actual calculation or value
  const totalSimpleInterest = 1234.56; // Example value

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const { stats: fetchedStats } = await getDashboardStats();

        if (fetchedStats.topGivers && Array.isArray(fetchedStats.topGivers)) {
          fetchedStats.topCreditors = fetchedStats.topGivers.map(item => ({
            id: item.personId,
            name: item.Person?.name || 'Unknown',
            balance: parseFloat(item.total || 0)
          }));
        }
        if (fetchedStats.topReceivers && Array.isArray(fetchedStats.topReceivers)) {
          fetchedStats.topDebtors = fetchedStats.topReceivers.map(item => ({
            id: item.personId,
            name: item.Person?.name || 'Unknown',
            balance: -parseFloat(item.total || 0)
          }));
        }

        const processedStats = {
          balance: fetchedStats.balance || 0,
          totalGiven: fetchedStats.totalGiven || 0,
          totalReceived: fetchedStats.totalReceived || 0,
          receivedCount: fetchedStats.receivedCount || 0,
          givenCount: fetchedStats.givenCount || 0,
          recentTransactions: fetchedStats.recentTransactions || [],
          topCreditors: fetchedStats.topCreditors || [],
          topDebtors: fetchedStats.topDebtors || []
        };

        setStats(processedStats);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  const getBalanceStatus = (balance) => {
    if (balance > 0) return { type: 'positive', message: 'You are owed this amount', icon: '⬆️' };
    if (balance < 0) return { type: 'negative', message: 'You owe this amount', icon: '⬇️' };
    return { type: 'neutral', message: 'No outstanding balance', icon: '⚖️' };
  };

  const balanceStatus = getBalanceStatus(stats?.balance || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl animate-fade-in">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow border border-gray-100 overflow-hidden mb-8">
          <div className="px-8 py-6 border-b border-gray-100 bg-primary-50">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
              <div className="mb-6 lg:mb-0">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-primary-700">Financial Dashboard</h1>
                    <p className="text-primary-500 text-sm font-medium">Track and manage your financial transactions</p>
                  </div>
                </div>
                {stats && (
                  <div className="flex items-center space-x-6 text-sm">
                    <span className="flex items-center bg-primary-100 px-3 py-1 rounded-full">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mr-2"></span>
                      <span className="text-primary-700 font-medium">{stats.receivedCount} received</span>
                    </span>
                    <span className="flex items-center bg-primary-100 px-3 py-1 rounded-full">
                      <span className="w-2 h-2 bg-primary-600 rounded-full mr-2"></span>
                      <span className="text-primary-700 font-medium">{stats.givenCount} given</span>
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/transactions/new"
                  className="flex items-center shadow hover:shadow-md transition-all duration-300 text-white bg-primary-600 hover:bg-primary-700 rounded-lg text-sm px-5 py-2.5 font-medium"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add Transaction
                </Link>
                <Link
                  to="/people/new"
                  className="flex items-center shadow hover:shadow-md transition-all duration-300 text-primary-600 bg-white border border-primary-600 hover:bg-primary-50 rounded-lg text-sm px-5 py-2.5 font-medium"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                  </svg>
                  Add Person
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-1 shadow-lg border border-secondary-200/50 max-w-lg">
          {[
            { key: 'summary', label: 'Summary', icon: '📊' },
            { key: 'interest', label: 'Interest', icon: '📈' },
            { key: 'transactions', label: 'Transactions', icon: '💳' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveView(tab.key)}
              className={`flex-1 py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
                activeView === tab.key
                  ? 'bg-primary-50 text-primary-700 shadow-md transform scale-105'
                  : 'text-secondary-600 hover:bg-secondary-100 hover:text-primary-600'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        {activeView === 'summary' && stats && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {/* Net Balance Card */}
              <div className="group bg-white rounded-3xl shadow-xl p-8 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 border border-gray-100">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">{balanceStatus.icon}</span>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-500 mb-1">Net Balance</div>
                    <div className={`text-3xl font-bold ${
                      stats.balance > 0 ? 'text-success-600' : 
                      stats.balance < 0 ? 'text-danger-600' : 
                      'text-secondary-600'
                    }`}>
                      {formatCurrency(stats.balance)}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium text-primary-600 bg-primary-50 rounded-full px-3 py-1 inline-block">
                  {balanceStatus.message}
                </div>
              </div>

              {/* Total Given Card */}
              <div className="group bg-white rounded-3xl shadow-xl p-8 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 border border-gray-100">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">⬆️</span>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-500 mb-1">Total Given</div>
                    <div className="text-3xl font-bold text-danger-600">
                      {formatCurrency(Math.abs(stats.totalGiven))}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium text-primary-600 bg-primary-50 rounded-full px-3 py-1 inline-block">
                  Money you have lent or paid
                </div>
              </div>

              {/* Total Received Card */}
              <div className="group bg-white rounded-3xl shadow-xl p-8 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 border border-gray-100">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">⬇️</span>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-500 mb-1">Total Received</div>
                    <div className="text-3xl font-bold text-success-600">
                      {formatCurrency(stats.totalReceived)}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium text-primary-600 bg-primary-50 rounded-full px-3 py-1 inline-block">
                  Money you have received
                </div>
              </div>
            </div>

            {/* Top Creditors & Debtors */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
              {/* Top Creditors */}
              <div className="bg-white rounded-3xl shadow border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-primary-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                      <span className="text-xl text-primary-600">👤</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-primary-700">Top Creditors</h2>
                      <p className="text-primary-500 text-sm">People who owe you money</p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  {stats.topCreditors && stats.topCreditors.length > 0 ? (
                    <div className="space-y-4">
                      {stats.topCreditors.map((person, index) => (
                        <div key={person.id || index} className="group flex items-center justify-between p-4 bg-primary-50 rounded-2xl border border-primary-100 hover:bg-primary-100 transition-all">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 font-bold text-lg shadow group-hover:scale-110 transition-transform duration-200">
                              {index + 1}
                            </div>
                            <div className="w-8 h-8 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 font-semibold">
                              {person.name[0].toUpperCase()}
                            </div>
                            <Link to={`/people/${person.id}`} className="text-secondary-900 hover:text-primary-600 font-semibold text-lg group-hover:text-primary-600 transition-colors">
                              {person.name}
                            </Link>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-success-600">
                              {formatCurrency(person.balance)}
                            </div>
                            <div className="text-xs text-secondary-500 mt-1">They owe you</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                        <span className="text-3xl text-primary-600">💰</span>
                      </div>
                      <p className="text-secondary-500 text-center text-lg font-medium mb-4">No people who owe you money</p>
                      <Link to="/people/new" className="text-white bg-primary-600 hover:bg-primary-700 font-medium rounded-lg text-sm px-4 py-2 transition-colors">
                        Add a person
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Debtors */}
              <div className="bg-white rounded-3xl shadow border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-primary-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                      <span className="text-xl text-primary-600">👥</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-primary-700">Top Debtors</h2>
                      <p className="text-primary-500 text-sm">People you owe money to</p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  {stats.topDebtors && stats.topDebtors.length > 0 ? (
                    <div className="space-y-4">
                      {stats.topDebtors.map((person, index) => (
                        <div key={person.id || index} className="group flex items-center justify-between p-4 bg-primary-50 rounded-2xl border border-primary-100 hover:bg-primary-100 transition-all">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 font-bold text-lg shadow group-hover:scale-110 transition-transform duration-200">
                              {index + 1}
                            </div>
                            <div className="w-8 h-8 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 font-semibold">
                              {person.name[0].toUpperCase()}
                            </div>
                            <Link to={`/people/${person.id}`} className="text-secondary-900 hover:text-primary-600 font-semibold text-lg group-hover:text-primary-600 transition-colors">
                              {person.name}
                            </Link>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-danger-600">
                              {formatCurrency(Math.abs(person.balance))}
                            </div>
                            <div className="text-xs text-secondary-500 mt-1">You owe them</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                        <span className="text-3xl text-primary-600">🤝</span>
                      </div>
                      <p className="text-secondary-500 text-center text-lg font-medium mb-4">No people you owe money to</p>
                      <Link to="/people/new" className="text-white bg-primary-600 hover:bg-primary-700 font-medium rounded-lg text-sm px-4 py-2 transition-colors">
                        Add a person
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Interest View */}
        {activeView === 'interest' && (
          <InterestSummary />
        )}

        {/* Recent Transactions */}
        {activeView === 'transactions' && (
          <div className="bg-white rounded-3xl shadow border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 bg-primary-50 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl text-primary-600">💳</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-primary-700">Recent Transactions</h2>
                  <p className="text-primary-500">Your latest financial activities</p>
                </div>
              </div>
              <Link to="/transactions" className="bg-primary-100 hover:bg-primary-200 text-primary-700 px-4 py-2 rounded-xl font-semibold transition-all">
                View All
              </Link>
            </div>
            {stats.recentTransactions && stats.recentTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary-50">
                    <tr>
                      <th className="px-8 py-4 text-left text-sm font-bold text-primary-700 uppercase tracking-wider">Date</th>
                      <th className="px-8 py-4 text-left text-sm font-bold text-primary-700 uppercase tracking-wider">Person</th>
                      <th className="px-8 py-4 text-left text-sm font-bold text-primary-700 uppercase tracking-wider">Description</th>
                      <th className="px-8 py-4 text-right text-sm font-bold text-primary-700 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentTransactions.map((transaction, index) => (
                      <tr key={transaction.id} className={`hover:bg-primary-50 transition-all ${index % 2 === 0 ? 'bg-white' : 'bg-primary-50'}`}>
                        <td className="px-8 py-6 text-sm font-medium text-secondary-900">
                          {formatDate(transaction.transactionDate)}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 font-semibold">
                              {transaction.Person?.name ? transaction.Person.name[0].toUpperCase() : '?'}
                            </div>
                            <Link to={`/people/${transaction.personId}`} className="text-primary-600 hover:text-primary-700 font-semibold text-sm hover:underline transition-colors">
                              {transaction.Person?.name || 'Unknown'}
                            </Link>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-sm text-secondary-700 font-medium">
                          {transaction.description || '-'}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className={`font-bold text-lg ${transaction.isMoneyReceived ? 'text-success-600' : 'text-danger-600'}`}>
                            {transaction.isMoneyReceived ? '+' : '-'} {formatCurrency(Math.abs(transaction.amount))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-16 text-center">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl text-primary-600">📋</span>
                </div>
                <h3 className="text-2xl font-bold text-primary-700 mb-4">No transactions recorded yet</h3>
                <p className="text-secondary-500 text-lg mb-8">Start by adding your first transaction or person</p>
                <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link to="/transactions/new" className="flex items-center justify-center shadow hover:shadow-md transition-all text-white bg-primary-600 hover:bg-primary-700 rounded-lg px-4 py-2">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Add Transaction
                  </Link>
                  <Link to="/people/new" className="flex items-center justify-center shadow hover:shadow-md transition-all text-primary-600 bg-white border border-primary-600 hover:bg-primary-50 rounded-lg px-4 py-2">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                    </svg>
                    Add Person
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;