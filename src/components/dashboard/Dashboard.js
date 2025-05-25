// src/components/dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../../api/transactionsApi';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';
import InterestSummary from './InterestSummary';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState([]);
  const [activeView, setActiveView] = useState('summary');

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
          topDebtors: fetchedStats.topDebtors || [],
          transactionsByMonth: fetchedStats.transactionsByMonth || []
        };

        setStats(processedStats);

        if (fetchedStats.transactionsByMonth && fetchedStats.transactionsByMonth.length) {
          const monthsData = {};
          fetchedStats.transactionsByMonth.forEach(item => {
            const date = new Date(item.month);
            const monthKey = date.toISOString().split('T')[0].substring(0, 7);
            if (!monthsData[monthKey]) {
              monthsData[monthKey] = {
                month: monthKey,
                monthName: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
                shortMonth: date.toLocaleDateString('en-US', { month: 'short' }),
                received: 0,
                given: 0
              };
            }
            if (item.isMoneyReceived) {
              monthsData[monthKey].received += parseFloat(item.total || 0);
            } else {
              monthsData[monthKey].given += parseFloat(item.total || 0);
            }
          });
          const chartDataArray = Object.values(monthsData).sort((a, b) => a.month.localeCompare(b.month));
          chartDataArray.forEach(item => {
            item.net = item.received - item.given;
          });
          setChartData(chartDataArray);
        }
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

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-700 to-primary-400 text-transparent bg-clip-text">
            Financial Dashboard
          </h1>
          <p className="text-secondary-500 mt-1">Track and manage your financial transactions</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Link to="/transactions/new" className="btn btn-primary flex items-center shadow-md hover:shadow-lg transition">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add Transaction
          </Link>
          <Link to="/people/new" className="btn btn-secondary flex items-center shadow-md hover:shadow-lg transition">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
            Add Person
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8 bg-white rounded-lg p-1 shadow border border-secondary-200 max-w-md overflow-x-auto">
        {['summary', 'chart', 'interest', 'transactions'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveView(tab)}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition ${
              activeView === tab
                ? 'bg-primary-50 text-primary-700 shadow'
                : 'text-secondary-700 hover:bg-secondary-50'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Summary View */}
      {activeView === 'summary' && stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Balance Card */}
            <div className={`stat-card shadow-lg rounded-xl p-6 ${
              stats.balance > 0
                ? 'border-l-4 border-success-500 bg-gradient-to-br from-success-50 to-white'
                : stats.balance < 0
                  ? 'border-l-4 border-danger-500 bg-gradient-to-br from-danger-50 to-white'
                  : 'bg-gradient-to-br from-secondary-50 to-white'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="stat-card-title text-secondary-700">Current Balance</h3>
                  <p className={`stat-card-value text-3xl font-bold mt-2 ${
                    stats.balance > 0
                      ? 'text-success-600'
                      : stats.balance < 0
                        ? 'text-danger-600'
                        : 'text-secondary-900'
                  }`}>
                    {formatCurrency(stats.balance)}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${
                  stats.balance > 0
                    ? 'bg-success-100 text-success-600'
                    : stats.balance < 0
                      ? 'bg-danger-100 text-danger-600'
                      : 'bg-secondary-100 text-secondary-600'
                }`}>
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
            {/* Total Given */}
            <div className="stat-card shadow-lg rounded-xl p-6 bg-danger-50 border-l-4 border-danger-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="stat-card-title text-secondary-700">Total Given</h3>
                  <p className="stat-card-value text-3xl font-bold mt-2 text-danger-600">
                    {formatCurrency(-stats.totalGiven)}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-danger-100 text-danger-600">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                </div>
              </div>
            </div>
            {/* Total Received */}
            <div className="stat-card shadow-lg rounded-xl p-6 bg-success-50 border-l-4 border-success-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="stat-card-title text-secondary-700">Total Received</h3>
                  <p className="stat-card-value text-3xl font-bold mt-2 text-success-600">
                    {formatCurrency(stats.totalReceived)}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-success-100 text-success-600">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          {/* Top Creditors & Debtors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Top Creditors */}
            <div className="card shadow rounded-xl">
              <div className="card-header px-6 pt-6">
                <h2 className="text-lg font-semibold text-secondary-900">Top Creditors</h2>
              </div>
              <div className="p-6">
                {stats.topCreditors && stats.topCreditors.length > 0 ? (
                  <ul className="divide-y divide-secondary-200">
                    {stats.topCreditors.map((person, index) => (
                      <li key={person.id || index} className="py-3 flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="w-7 h-7 flex items-center justify-center rounded-full bg-primary-100 text-primary-700 font-bold text-base mr-3">
                            {index + 1}
                          </span>
                          <Link to={`/people/${person.id}`} className="text-secondary-900 hover:text-primary-600 font-medium">
                            {person.name}
                          </Link>
                        </div>
                        <span className="text-success-600 font-semibold">
                          {formatCurrency(person.balance)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="py-6 flex flex-col items-center justify-center">
                    <svg className="w-10 h-10 text-secondary-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                    <p className="text-secondary-500 text-center">No people who owe you money</p>
                    <Link to="/people/new" className="mt-2 text-sm text-primary-600 hover:text-primary-800">
                      Add a person
                    </Link>
                  </div>
                )}
              </div>
            </div>
            {/* Top Debtors */}
            <div className="card shadow rounded-xl">
              <div className="card-header px-6 pt-6">
                <h2 className="text-lg font-semibold text-secondary-900">Top Debtors</h2>
              </div>
              <div className="p-6">
                {stats.topDebtors && stats.topDebtors.length > 0 ? (
                  <ul className="divide-y divide-secondary-200">
                    {stats.topDebtors.map((person, index) => (
                      <li key={person.id || index} className="py-3 flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="w-7 h-7 flex items-center justify-center rounded-full bg-primary-100 text-primary-700 font-bold text-base mr-3">
                            {index + 1}
                          </span>
                          <Link to={`/people/${person.id}`} className="text-secondary-900 hover:text-primary-600 font-medium">
                            {person.name}
                          </Link>
                        </div>
                        <span className="text-danger-600 font-semibold">
                          {formatCurrency(person.balance)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="py-6 flex flex-col items-center justify-center">
                    <svg className="w-10 h-10 text-secondary-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    <p className="text-secondary-500 text-center">No people you owe money to</p>
                    <Link to="/people/new" className="mt-2 text-sm text-primary-600 hover:text-primary-800">
                      Add a person
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Chart View */}
      {activeView === 'chart' && (
        <div className="card shadow rounded-xl mb-8">
          <div className="card-header px-6 pt-6">
            <h2 className="text-lg font-semibold text-secondary-900">Monthly Transactions</h2>
          </div>
          <div className="p-6">
            {chartData && chartData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="monthName" stroke="#64748b" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} tickFormatter={v => `$${Math.abs(v)}`} />
                    <Tooltip
                      formatter={v => [`$${Math.abs(v).toFixed(2)}`, '']}
                      labelFormatter={v => `${v}`}
                      contentStyle={{
                        borderRadius: '0.5rem',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        fontSize: '0.875rem'
                      }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="received" name="Money Received" stackId="1" stroke="#22c55e" fill="#dcfce7" />
                    <Area type="monotone" dataKey="given" name="Money Given" stackId="1" stroke="#ef4444" fill="#fee2e2" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex flex-col items-center justify-center">
                <svg className="w-16 h-16 text-secondary-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <h3 className="text-lg font-medium text-secondary-700 mb-2">No Chart Data Available</h3>
                <p className="text-secondary-500 text-center max-w-md mb-4">
                  Start tracking your finances by adding transactions. Your financial trends will appear here once you have data.
                </p>
                <Link to="/transactions/new" className="btn btn-primary flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add First Transaction
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interest View */}
      {activeView === 'interest' && (
        <div className="card shadow rounded-xl mb-8">
          <div className="card-header px-6 pt-6">
            <h2 className="text-lg font-semibold text-secondary-900">Interest Analysis</h2>
            <p className="text-secondary-500 text-sm mt-1">
              Track how much interest you're earning or paying on your transactions
            </p>
          </div>
          <div className="p-6">
            <InterestSummary />
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {activeView === 'transactions' && (
        <div className="card shadow rounded-xl">
          <div className="card-header flex justify-between items-center px-6 pt-6">
            <h2 className="text-lg font-semibold text-secondary-900">Recent Transactions</h2>
            <Link to="/transactions" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
              View All
            </Link>
          </div>
          {stats.recentTransactions && stats.recentTransactions.length > 0 ? (
            <div className="overflow-x-auto p-6">
              <table className="table w-full">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Date</th>
                    <th className="table-header-cell">Person</th>
                    <th className="table-header-cell">Description</th>
                    <th className="table-header-cell text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {stats.recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="table-row hover:bg-primary-50 transition">
                      <td className="table-cell">{formatDate(transaction.transactionDate)}</td>
                      <td className="table-cell">
                        <Link to={`/people/${transaction.personId}`} className="text-primary-600 hover:text-primary-800 hover:underline font-medium">
                          {transaction.Person?.name || 'Unknown'}
                        </Link>
                      </td>
                      <td className="table-cell">{transaction.description || '-'}</td>
                      <td className={`table-cell text-right font-medium ${
                        transaction.isMoneyReceived ? 'text-success-600' : 'text-danger-600'
                      }`}>
                        {transaction.isMoneyReceived ? '+' : '-'} {formatCurrency(Math.abs(transaction.amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
              <p className="mt-4 text-secondary-500">No transactions recorded yet</p>
              <div className="mt-4 flex justify-center space-x-4">
                <Link to="/transactions/new" className="btn btn-primary flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add Transaction
                </Link>
                <Link to="/people/new" className="btn btn-secondary flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  );
};

export default Dashboard;
