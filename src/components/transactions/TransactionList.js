// src/components/transactions/TransactionList.js with Interest Info
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getTransactions, deleteTransaction, exportTransactions } from '../../api/transactionsApi';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getPeople } from '../../api/peopleApi';
import SearchFilter from './SearchFilter';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';
import ConfirmDialog from '../ui/ConfirmDialog';

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [people, setPeople] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [showInterestColumn, setShowInterestColumn] = useState(false);

  // Filter and sort states
  const [filterParams, setFilterParams] = useState({
    sortBy: 'transactionDate',
    sortOrder: 'DESC',
    personId: '',
    search: '',
    startDate: '',
    endDate: '',
    isMoneyReceived: '',
    category: '',
    isSettled: '',
    applyInterest: '' // New filter for interest-bearing transactions
  });

  // Statistics state
  const [stats, setStats] = useState({
    totalShowing: 0,
    totalAmount: 0,
    totalReceived: 0,
    totalGiven: 0,
    totalSimpleInterest: 0, // New stat for simple interest
    totalCompoundInterest: 0 // New stat for compound interest
  });

  // Load transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setNoResults(false);

        const { transactions: transactionsData, stats: statsData } = await getTransactions(filterParams);

        setTransactions(transactionsData || []);

        // Check if any transaction has interest applied to show interest column
        if (transactionsData && transactionsData.length > 0) {
          const hasInterest = transactionsData.some(t => t.applyInterest);
          setShowInterestColumn(hasInterest);
        } else {
          setShowInterestColumn(false);
        }

        // Calculate stats directly from transactions
        if (Array.isArray(transactionsData)) {
          let totalReceived = 0;
          let totalGiven = 0;
          let totalSimpleInterest = 0;
          let totalCompoundInterest = 0;

          transactionsData.forEach(transaction => {
            const amount = parseFloat(transaction.amount);
            if (transaction.isMoneyReceived) {
              totalReceived += amount;
            } else {
              totalGiven += amount;
            }

            // Add interest statistics if available
            if (transaction.applyInterest) {
              if (transaction.interestType === 'simple') {
                // Roughly estimate simple interest for the table view
                const days = Math.floor((new Date() - new Date(transaction.transactionDate)) / (1000 * 60 * 60 * 24));
                const interestRate = parseFloat(transaction.interestRate || 10) / 100;
                const interest = amount * interestRate * (days / 365);
                totalSimpleInterest += transaction.isMoneyReceived ? interest : -interest;
              } else if (transaction.interestType === 'compound') {
                // Roughly estimate compound interest for the table view
                const days = Math.floor((new Date() - new Date(transaction.transactionDate)) / (1000 * 60 * 60 * 24));
                const interestRate = parseFloat(transaction.interestRate || 12) / 100;
                const compoundFrequency = parseInt(transaction.compoundFrequency || 12);
                const years = days / 365;
                const totalWithInterest = amount * Math.pow(1 + (interestRate / compoundFrequency), compoundFrequency * years);
                const interest = totalWithInterest - amount;
                totalCompoundInterest += transaction.isMoneyReceived ? interest : -interest;
              }
            }
          });

          setStats({
            totalShowing: transactionsData.length,
            totalReceived: totalReceived,
            totalGiven: totalGiven,
            totalAmount: totalReceived - totalGiven,
            totalSimpleInterest,
            totalCompoundInterest
          });

          setNoResults(transactionsData.length === 0);
        } else {
          setStats({
            totalShowing: 0,
            totalReceived: 0,
            totalGiven: 0,
            totalAmount: 0,
            totalSimpleInterest: 0,
            totalCompoundInterest: 0
          });
          setNoResults(true);
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [filterParams]);

  // Load people for filter dropdown
  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const { people } = await getPeople();
        setPeople(people || []);
      } catch (err) {
        console.error('Error fetching people:', err);
      }
    };

    fetchPeople();
  }, []);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilterParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle sort changes
  const handleSort = (column) => {
    setFilterParams(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC'
    }));
  };

  // Handle transaction deletion
  const handleDelete = async () => {
    if (!selectedTransaction) return;

    try {
      setDeleteLoading(true);
      await deleteTransaction(selectedTransaction.id);

      // Remove from state
      setTransactions(prev =>
        prev.filter(transaction => transaction.id !== selectedTransaction.id)
      );

      // Update stats
      const amount = parseFloat(selectedTransaction.amount);
      setStats(prev => {
        const newStats = { ...prev };
        newStats.totalShowing -= 1;

        if (selectedTransaction.isMoneyReceived) {
          newStats.totalReceived -= amount;
        } else {
          newStats.totalGiven -= amount;
        }

        newStats.totalAmount = newStats.totalReceived - newStats.totalGiven;
        return newStats;
      });

      setShowDeleteDialog(false);
      setSelectedTransaction(null);
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError('Failed to delete transaction. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle export
  const handleExport = () => {
    try {
      exportTransactions();
    } catch (err) {
      console.error('Error exporting transactions:', err);
      setError('Failed to export transactions. Please try again.');
    }
  };

  // Memoized active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterParams.personId) count++;
    if (filterParams.search) count++;
    if (filterParams.startDate) count++;
    if (filterParams.endDate) count++;
    if (filterParams.isMoneyReceived !== '') count++;
    if (filterParams.category) count++;
    if (filterParams.isSettled !== '') count++;
    if (filterParams.applyInterest !== '') count++; // Count interest filter
    return count;
  }, [filterParams]);

  if (loading && transactions.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Transactions</h1>
          <p className="text-secondary-500 mt-1">Manage your financial transactions</p>
        </div>
        <div className="space-x-3 mt-4 md:mt-0">
          <Link
            to="/transactions/new"
            className="btn btn-primary"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add Transaction
          </Link>
          <button
            onClick={handleExport}
            className="btn btn-success"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      <div className="card mb-6">
        <div className="card-header flex justify-between items-center">
          <h2 className="text-lg font-semibold text-secondary-900">Filter Transactions</h2>
          {activeFiltersCount > 0 && (
            <span className="badge badge-info">{activeFiltersCount} filters active</span>
          )}
        </div>
        <SearchFilter
          params={filterParams}
          onChange={handleFilterChange}
          people={people}
          showInterestFilter={true} // Enable interest filter
        />
      </div>

      {/* Transactions Summary */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="card p-4 bg-secondary-50">
            <div className="text-sm text-secondary-500 mb-1">Showing</div>
            <div className="text-xl font-bold text-secondary-900">{stats.totalShowing} transactions</div>
          </div>
          <div className="card p-4 bg-success-50">
            <div className="text-sm text-secondary-500 mb-1">Total Received</div>
            <div className="text-xl font-bold text-success-600">{formatCurrency(stats.totalReceived)}</div>
          </div>
          <div className="card p-4 bg-danger-50">
            <div className="text-sm text-secondary-500 mb-1">Total Given</div>
            <div className="text-xl font-bold text-danger-600">{formatCurrency(stats.totalGiven)}</div>
          </div>
          <div className="card p-4 bg-primary-50">
            <div className="text-sm text-secondary-500 mb-1">Net Balance</div>
            <div className={`text-xl font-bold ${stats.totalAmount >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
              {formatCurrency(stats.totalAmount)}
            </div>
          </div>
        </div>
      )}

      {/* Interest Summary - Only show if interest column is visible */}
      {showInterestColumn && (
        <div className="card p-4 mb-6 bg-secondary-50">
          <h3 className="text-md font-medium text-secondary-800 mb-3">Interest Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-secondary-600">Simple Interest:</span>
                <span className={`font-medium ${stats.totalSimpleInterest >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                  {formatCurrency(stats.totalSimpleInterest)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-secondary-500">
                <span>Total with Simple Interest:</span>
                <span>
                  {formatCurrency(stats.totalAmount + stats.totalSimpleInterest)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-secondary-600">Compound Interest:</span>
                <span className={`font-medium ${stats.totalCompoundInterest >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                  {formatCurrency(stats.totalCompoundInterest)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-secondary-500">
                <span>Total with Compound Interest:</span>
                <span>
                  {formatCurrency(stats.totalAmount + stats.totalCompoundInterest)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th
                className="table-header-cell cursor-pointer"
                onClick={() => handleSort('transactionDate')}
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  {filterParams.sortBy === 'transactionDate' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      {filterParams.sortOrder === 'ASC' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      )}
                    </svg>
                  )}
                </div>
              </th>
              <th
                className="table-header-cell cursor-pointer"
                onClick={() => handleSort('Person.name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Person</span>
                  {filterParams.sortBy === 'Person.name' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      {filterParams.sortOrder === 'ASC' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      )}
                    </svg>
                  )}
                </div>
              </th>
              <th className="table-header-cell">
                Description
              </th>
              <th className="table-header-cell">
                Category
              </th>
              <th
                className="table-header-cell text-right cursor-pointer"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Amount</span>
                  {filterParams.sortBy === 'amount' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      {filterParams.sortOrder === 'ASC' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      )}
                    </svg>
                  )}
                </div>
              </th>
              {/* Interest Column - only show if there are interest-bearing transactions */}
              {showInterestColumn && (
                <th className="table-header-cell text-right">
                  Interest
                </th>
              )}
              <th className="table-header-cell text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="table-body">
            {noResults ? (
              <tr>
                <td colSpan={showInterestColumn ? 7 : 6} className="px-4 py-8 text-center">
                  <div className="flex flex-col items-center justify-center py-6">
                    <svg className="w-12 h-12 text-secondary-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                    </svg>
                    <p className="text-secondary-500 text-lg mb-2 font-medium">No transactions found</p>
                    <p className="text-secondary-400 mb-4">Try adjusting your filters or add a new transaction</p>
                    <Link to="/transactions/new" className="btn btn-primary">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      Add Transaction
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => {
                // Calculate interest for display in the table
                let interestInfo = null;
                if (transaction.applyInterest) {
                  const days = Math.floor((new Date() - new Date(transaction.transactionDate)) / (1000 * 60 * 60 * 24));
                  const amount = parseFloat(transaction.amount);

                  if (transaction.interestType === 'simple') {
                    const interestRate = parseFloat(transaction.interestRate || 10) / 100;
                    const interest = amount * interestRate * (days / 365);
                    interestInfo = {
                      type: 'simple',
                      amount: interest,
                      days
                    };
                  } else if (transaction.interestType === 'compound') {
                    const interestRate = parseFloat(transaction.interestRate || 12) / 100;
                    const compoundFrequency = parseInt(transaction.compoundFrequency || 12);
                    const years = days / 365;
                    const totalWithInterest = amount * Math.pow(1 + (interestRate / compoundFrequency), compoundFrequency * years);
                    const interest = totalWithInterest - amount;
                    interestInfo = {
                      type: 'compound',
                      amount: interest,
                      days
                    };
                  }
                }

                return (
                  <tr key={transaction.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex flex-col">
                        <span className="font-medium">{formatDate(transaction.transactionDate)}</span>
                        {transaction.reminderDate && (
                          <span className="text-xs text-secondary-400">
                            Reminder: {formatDate(transaction.reminderDate)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <Link
                        to={`/people/${transaction.Person.id}`}
                        className="text-primary-600 hover:text-primary-800 hover:underline font-medium"
                      >
                        {transaction.Person.name}
                      </Link>
                      {transaction.isSettled && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                          Settled
                        </span>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="max-w-xs truncate">
                        {transaction.description || '-'}
                      </div>
                    </td>
                    <td className="table-cell">
                      {transaction.category ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                          {transaction.category}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className={`table-cell text-right font-medium ${
                      transaction.isMoneyReceived ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      <div className="flex flex-col items-end">
                        <span>{transaction.isMoneyReceived ? '+' : '-'} {formatCurrency(Math.abs(transaction.amount))}</span>
                        {transaction.paymentMethod && (
                          <span className="text-xs text-secondary-400">
                            via {transaction.paymentMethod}
                          </span>
                        )}
                      </div>
                    </td>
                    {/* Interest Column - only show if interest column is visible */}
                    {showInterestColumn && (
                      <td className="table-cell text-right">
                        {interestInfo ? (
                          <div className="flex flex-col items-end">
                            <span className={`font-medium ${
                              transaction.isMoneyReceived ? 'text-success-600' : 'text-danger-600'
                            }`}>
                              {transaction.isMoneyReceived ? '+' : '-'} {formatCurrency(Math.abs(interestInfo.amount))}
                            </span>
                            <span className="text-xs text-secondary-400">
                              {interestInfo.type === 'simple' ? 'Simple' : 'Compound'} • {interestInfo.days} days
                            </span>
                          </div>
                        ) : (
                          <span className="text-secondary-400">-</span>
                        )}
                      </td>
                    )}
                    <td className="table-cell text-right space-x-2 whitespace-nowrap">
                      <Link
                        to={`/transactions/edit/${transaction.id}`}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-primary-700 bg-primary-50 hover:bg-primary-100"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        Edit
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowDeleteDialog(true);
                        }}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-danger-700 bg-danger-50 hover:bg-danger-100"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Transaction"
        message={
          selectedTransaction
            ? <>
                <p>Are you sure you want to delete this transaction?</p>
                <div className="mt-2 p-3 bg-secondary-50 rounded-lg text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-secondary-500">Person:</span>
                    <span className="font-medium">{selectedTransaction.Person?.name}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-secondary-500">Date:</span>
                    <span className="font-medium">{formatDate(selectedTransaction.transactionDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-500">Amount:</span>
                    <span className={`font-medium ${selectedTransaction.isMoneyReceived ? 'text-success-600' : 'text-danger-600'}`}>
                      {selectedTransaction.isMoneyReceived ? '+' : '-'} {formatCurrency(Math.abs(selectedTransaction.amount))}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-danger-600">This action cannot be undone.</p>
              </>
            : 'Are you sure you want to delete this transaction? This action cannot be undone.'
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
  );
};

export default TransactionList;