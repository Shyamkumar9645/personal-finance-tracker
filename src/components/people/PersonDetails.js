import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPerson, getPersonTransactions } from '../../api/peopleApi';
import { deleteTransaction, exportTransactions } from '../../api/transactionsApi';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';
import ConfirmDialog from '../ui/ConfirmDialog';
import PersonChart from './PersonChart';

const PersonDetails = () => {
  const [person, setPerson] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('transactions');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPersonData = async () => {
      try {
        setLoading(true);
        const { person: personData } = await getPerson(id);
        setPerson(personData);

        const { transactions: transactionsData, summary: summaryData } = await getPersonTransactions(id);
        setTransactions(transactionsData || []);
        setSummary(summaryData);
      } catch (err) {
        setError('Failed to load person data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchPersonData();
  }, [id]);

  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return;
    try {
      setDeleteLoading(true);
      await deleteTransaction(selectedTransaction.id);
      setTransactions(prev => prev.filter(t => t.id !== selectedTransaction.id));
      setShowDeleteDialog(false);
      setSelectedTransaction(null);
    } catch (err) {
      setError('Failed to delete transaction. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExport = () => {
    try {
      exportTransactions(id);
    } catch (err) {
      setError('Failed to export transactions. Please try again.');
    }
  };

  if (loading && !person) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!person) return <ErrorAlert message="Person not found" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl animate-fade-in">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link
            to="/people"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to People
          </Link>
        </div>

        {/* Person Header */}
        <div className="bg-white rounded-3xl shadow border border-gray-100 overflow-hidden mb-8">
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl text-primary-600">{person.name[0].toUpperCase()}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{person.name}</h1>
                <div className="flex flex-wrap items-center space-x-4 text-primary-100">
                  {person.email && (
                    <a href={`mailto:${person.email}`} className="inline-flex items-center hover:text-white transition-colors">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                      {person.email}
                    </a>
                  )}
                  {person.phone && (
                    <a href={`tel:${person.phone}`} className="inline-flex items-center hover:text-white transition-colors">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                      {person.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="px-8 py-6 flex flex-col sm:flex-row gap-3 bg-white">
            <Link
              to={`/transactions/new?personId=${person.id}`}
              className="btn btn-primary flex items-center shadow hover:shadow-md transition-all duration-300 text-white bg-primary-600 hover:bg-primary-700 rounded-lg text-sm px-5 py-2.5"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Transaction
            </Link>
            <Link
              to={`/people/edit/${person.id}`}
              className="btn btn-secondary flex items-center shadow hover:shadow-md transition-all duration-300 text-primary-600 bg-white border border-primary-600 hover:bg-primary-50 rounded-lg text-sm px-5 py-2.5"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              Edit Person
            </Link>
            <button
              onClick={handleExport}
              className="btn btn-secondary flex items-center shadow hover:shadow-md transition-all duration-300 text-primary-600 bg-white border border-primary-600 hover:bg-primary-50 rounded-lg text-sm px-5 py-2.5"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              Export CSV
            </button>
          </div>
          {person.notes && (
            <div className="px-8 pb-8">
              <div className="bg-primary-50/50 border border-primary-100/50 rounded-2xl p-6">
                <h3 className="font-bold text-primary-700 mb-3 flex items-center text-lg">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  Notes
                </h3>
                <p className="text-secondary-700 whitespace-pre-line font-medium">{person.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Summary Card */}
        {summary && (
          <div className="bg-white rounded-3xl shadow border border-gray-100 overflow-hidden mb-8">
            <div className="px-8 py-6 border-b border-gray-100 bg-primary-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl text-primary-600">💰</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-primary-700">Summary</h2>
                  <p className="text-primary-500 text-sm">Transactions and balance with this person</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="text-sm font-semibold text-secondary-600 mb-1">Current Balance</div>
                  <div className="text-3xl font-semibold text-primary-700 mb-2">
                    {formatCurrency(summary.balance)}
                  </div>
                  <div className="text-xs font-medium text-primary-600 bg-primary-50 rounded-full px-3 py-1 inline-block">
                    {summary.balance > 0
                      ? 'They owe you'
                      : summary.balance < 0
                        ? 'You owe them'
                        : 'No outstanding balance'}
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="text-sm font-semibold text-secondary-600 mb-1">You Received</div>
                  <div className="text-2xl font-semibold text-primary-700 mb-2">
                    {formatCurrency(summary.totalReceived)}
                  </div>
                  <div className="text-xs font-medium text-primary-600 bg-primary-50 rounded-full px-3 py-1 inline-block">
                    {summary.receivedCount || 0} incoming
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="text-sm font-semibold text-secondary-600 mb-1">You Gave</div>
                  <div className="text-2xl font-semibold text-primary-700 mb-2">
                    {formatCurrency(summary.totalGiven)}
                  </div>
                  <div className="text-xs font-medium text-primary-600 bg-primary-50 rounded-full px-3 py-1 inline-block">
                    {summary.givenCount || 0} outgoing
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-white rounded-2xl p-1 shadow border border-gray-200 max-w-md">
          {[
            { key: 'transactions', label: 'Transactions', icon: '💳' },
            { key: 'chart', label: 'Analytics', icon: '📊' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
                activeTab === tab.key
                  ? 'bg-primary-50 text-primary-700 shadow'
                  : 'text-secondary-600 hover:bg-secondary-100 hover:text-primary-600'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'transactions' ? (
          <div className="bg-white rounded-3xl shadow border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 bg-primary-50 flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <span className="text-xl text-primary-600">💳</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-primary-700">Transaction History</h2>
                <p className="text-primary-500 text-sm">{transactions.length} transaction{transactions.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            {transactions.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl text-primary-600">📋</span>
                </div>
                <h3 className="text-2xl font-bold text-primary-700 mb-4">No transactions found</h3>
                <p className="text-secondary-500 text-lg mb-8">Start by adding your first transaction with this person</p>
                <Link
                  to={`/transactions/new?personId=${person.id}`}
                  className="text-white bg-primary-600 hover:bg-primary-700 font-medium rounded-lg text-sm px-6 py-3 transition-colors inline-flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add a transaction
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary-50">
                    <tr>
                      <th className="px-8 py-4 text-left text-sm font-bold text-primary-700 uppercase tracking-wider">Date</th>
                      <th className="px-8 py-4 text-left text-sm font-bold text-primary-700 uppercase tracking-wider">Description</th>
                      <th className="px-8 py-4 text-right text-sm font-bold text-primary-700 uppercase tracking-wider">Amount</th>
                      <th className="px-8 py-4 text-right text-sm font-bold text-primary-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction, index) => (
                      <tr
                        key={transaction.id}
                        className={`hover:bg-primary-50 transition-all ${index % 2 === 0 ? 'bg-white' : 'bg-primary-50'}`}
                        onClick={() => navigate(`/transactions/edit/${transaction.id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className="px-8 py-6 text-sm font-medium text-secondary-900">
                          {formatDate(transaction.transactionDate)}
                        </td>
                        <td className="px-8 py-6">
                          <span className="font-medium text-secondary-900">{transaction.description || '-'}</span>
                          {transaction.isSettled && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-700">
                              ✓ Settled
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className={`font-bold text-lg ${transaction.isMoneyReceived ? 'text-primary-700' : 'text-red-600'}`}>
                            {transaction.isMoneyReceived ? '+' : '-'} {formatCurrency(Math.abs(transaction.amount))}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              to={`/transactions/edit/${transaction.id}`}
                              onClick={e => e.stopPropagation()}
                              className="w-8 h-8 bg-primary-100 hover:bg-primary-200 text-primary-600 rounded-lg flex items-center justify-center transition-colors"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                            </Link>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setSelectedTransaction(transaction);
                                setShowDeleteDialog(true);
                              }}
                              className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-colors"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 bg-primary-50 flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <span className="text-xl text-primary-600">📊</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-primary-700">Transaction Analytics</h2>
                <p className="text-primary-500 text-sm">Charts and insights for this person</p>
              </div>
            </div>
            <div className="p-8">
              {transactions.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl text-primary-600">📈</span>
                  </div>
                  <h3 className="text-xl font-bold text-primary-700 mb-4">No transaction data available</h3>
                  <p className="text-secondary-500 mb-2">Add transactions to see charts and insights.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-secondary-900 mb-6">Monthly Transaction History</h3>
                  <div className="h-80 mb-8 bg-primary-50/50 rounded-2xl p-4">
                    <PersonChart data={transactions} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-primary-50/50 border border-primary-100/50 rounded-2xl p-6">
                      <h4 className="text-lg font-bold text-primary-700 mb-4">Transaction Summary</h4>
                      <ul className="space-y-4">
                        <li className="flex justify-between items-center">
                          <span className="text-secondary-600 font-medium">Highest Transaction:</span>
                          <span className="font-bold text-primary-700">
                            {formatCurrency(Math.max(...transactions.map(t => Math.abs(t.amount))))}
                          </span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span className="text-secondary-600 font-medium">Average Transaction:</span>
                          <span className="font-bold text-primary-700">
                            {formatCurrency(transactions.reduce((acc, t) => acc + Math.abs(t.amount), 0) / transactions.length)}
                          </span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span className="text-secondary-600 font-medium">First Transaction:</span>
                          <span className="font-bold text-primary-700">
                            {formatDate(transactions.reduce((earliest, t) => {
                              const date = new Date(t.transactionDate);
                              return date < earliest ? date : earliest;
                            }, new Date()))}
                          </span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span className="text-secondary-600 font-medium">Latest Transaction:</span>
                          <span className="font-bold text-primary-700">
                            {formatDate(transactions.reduce((latest, t) => {
                              const date = new Date(t.transactionDate);
                              return date > latest ? date : latest;
                            }, new Date(0)))}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showDeleteDialog}
          title="Delete Transaction"
          message={
            selectedTransaction
              ? <>
                  <p className="text-secondary-700 mb-4">Are you sure you want to delete this transaction?</p>
                  <div className="bg-primary-50 rounded-2xl p-6 border border-primary-100">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-secondary-600 font-medium">Date:</span>
                        <span className="font-bold text-secondary-900">{formatDate(selectedTransaction.transactionDate)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-secondary-600 font-medium">Amount:</span>
                        <span className={`font-bold text-lg ${selectedTransaction.isMoneyReceived ? 'text-primary-700' : 'text-red-600'}`}>
                          {selectedTransaction.isMoneyReceived ? '+' : '-'} {formatCurrency(Math.abs(selectedTransaction.amount))}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-red-600 text-sm font-semibold flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    This action cannot be undone.
                  </p>
                </>
              : 'Are you sure you want to delete this transaction? This action cannot be undone.'
          }
          confirmText="Delete Transaction"
          cancelText="Cancel"
          onConfirm={handleDeleteTransaction}
          onCancel={() => {
            setShowDeleteDialog(false);
            setSelectedTransaction(null);
          }}
          isLoading={deleteLoading}
        />
      </div>
    </div>
  );
};

export default PersonDetails;
