import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getTransactions, deleteTransaction, exportTransactions } from '../../api/transactionsApi';
import { getPeople } from '../../api/peopleApi';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';
import ConfirmDialog from '../ui/ConfirmDialog';
import EmptyState from '../ui/EmptyState';

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [people, setPeople] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { transactions: txs } = await getTransactions();
        setTransactions(txs || []);
        const { people: peopleData } = await getPeople();
        setPeople(peopleData || []);
      } catch (err) {
        setError('Failed to load transactions. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!selectedTransaction) return;
    try {
      setDeleteLoading(true);
      await deleteTransaction(selectedTransaction.id);
      setTransactions(prev => prev.filter(tx => tx.id !== selectedTransaction.id));
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
      exportTransactions();
    } catch (err) {
      setError('Failed to export transactions. Please try again.');
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl animate-fade-in">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow border border-gray-100 overflow-hidden mb-8">
          <div className="px-8 py-6 border-b border-gray-100 bg-primary-50 flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <span className="text-xl text-primary-600">💳</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-700">All Transactions</h1>
              <p className="text-primary-500 text-sm">Track and manage all your financial activities</p>
            </div>
            <div className="ml-auto flex gap-2">
              <Link
                to="/transactions/new"
                className="btn btn-primary flex items-center shadow hover:shadow-md transition-all duration-300 text-white bg-primary-600 hover:bg-primary-700 rounded-lg text-sm px-5 py-2.5"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add Transaction
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
          </div>
          <div className="p-8">
            {transactions.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl text-primary-600">📋</span>
                </div>
                <h3 className="text-2xl font-bold text-primary-700 mb-4">No transactions found</h3>
                <p className="text-secondary-500 text-lg mb-8">Start by adding your first transaction</p>
                <Link
                  to="/transactions/new"
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
                      <th className="px-8 py-4 text-left text-sm font-bold text-primary-700 uppercase tracking-wider">Person</th>
                      <th className="px-8 py-4 text-left text-sm font-bold text-primary-700 uppercase tracking-wider">Description</th>
                      <th className="px-8 py-4 text-right text-sm font-bold text-primary-700 uppercase tracking-wider">Amount</th>
                      <th className="px-8 py-4 text-right text-sm font-bold text-primary-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction, idx) => (
                      <tr
                        key={transaction.id}
                        className={`hover:bg-primary-50 transition-all ${idx % 2 === 0 ? 'bg-white' : 'bg-primary-50'}`}
                        onClick={() => navigate(`/transactions/edit/${transaction.id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className="px-8 py-6 text-sm font-medium text-secondary-900">
                          {formatDate(transaction.transactionDate)}
                        </td>
                        <td className="px-8 py-6">
                          <Link
                            to={`/people/${transaction.personId}`}
                            onClick={e => e.stopPropagation()}
                            className="text-primary-600 hover:text-primary-700 font-semibold text-sm hover:underline transition-colors"
                          >
                            {transaction.Person?.name || 'Unknown'}
                          </Link>
                        </td>
                        <td className="px-8 py-6 text-secondary-900 font-medium">
                          {transaction.description || '-'}
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
        </div>
        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showDeleteDialog}
          title="Delete Transaction"
          message={
            selectedTransaction
              ? <>
                  <p className="text-secondary-700 mb-2">Are you sure you want to delete this transaction?</p>
                  <div className="bg-primary-50 rounded-2xl p-4 border border-primary-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-secondary-600 font-medium">Person:</span>
                      <span className="font-bold text-secondary-900">{selectedTransaction.Person?.name}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-secondary-600 font-medium">Date:</span>
                      <span className="font-bold text-secondary-900">{formatDate(selectedTransaction.transactionDate)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-secondary-600 font-medium">Amount:</span>
                      <span className={`font-bold ${selectedTransaction.isMoneyReceived ? 'text-primary-700' : 'text-red-600'}`}>
                        {selectedTransaction.isMoneyReceived ? '+' : '-'} {formatCurrency(Math.abs(selectedTransaction.amount))}
                      </span>
                    </div>
                  </div>
                  <p className="mt-4 text-red-600 text-sm font-semibold flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    This action cannot be undone.
                  </p>
                </>
              : 'Are you sure you want to delete this transaction?'
          }
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDelete}
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

export default TransactionList;
