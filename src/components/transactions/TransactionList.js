import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getTransactions, deleteTransaction, exportTransactions } from '../../api/transactionsApi';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getPeople } from '../../api/peopleApi';
import SearchFilter from './SearchFilter';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';
import ConfirmDialog from '../ui/ConfirmDialog';
import EmptyState from '../ui/EmptyState';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

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

  const [filterParams, setFilterParams] = useState({
    sortBy: 'transactionDate',
    sortOrder: 'DESC',
    personId: '',
    search: '',
    startDate: '',
    endDate: '',
    isMoneyReceived: '',
    isSettled: '',
    applyInterest: ''
  });

  const [stats, setStats] = useState({
    totalShowing: 0,
    totalAmount: 0,
    totalReceived: 0,
    totalGiven: 0,
    totalSimpleInterest: 0,
    totalCompoundInterest: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setNoResults(false);

        const { transactions: transactionsData } = await getTransactions(filterParams);

        setTransactions(transactionsData || []);
        if (transactionsData && transactionsData.length > 0) {
          const hasInterest = transactionsData.some(t => t.applyInterest);
          setShowInterestColumn(hasInterest);
        } else {
          setShowInterestColumn(false);
        }

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
            if (transaction.applyInterest) {
              const days = Math.floor((new Date() - new Date(transaction.transactionDate)) / (1000 * 60 * 60 * 24));
              const interestRate = parseFloat(transaction.interestRate || 0) / 100;
              if (transaction.interestType === 'simple') {
                const interest = amount * interestRate * (days / 365);
                totalSimpleInterest += transaction.isMoneyReceived ? interest : -interest;
              } else if (transaction.interestType === 'compound') {
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
            totalReceived,
            totalGiven,
            totalAmount: totalReceived - totalGiven,
            totalSimpleInterest,
            totalCompoundInterest
          });

          setNoResults(transactionsData.length === 0);
        }
      } catch (err) {
        setError('Failed to load transactions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [filterParams]);

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const { people } = await getPeople();
        setPeople(people || []);
      } catch (err) {}
    };
    fetchPeople();
  }, []);

  const handleFilterChange = (name, value) => {
    setFilterParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSort = (column) => {
    setFilterParams(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC'
    }));
  };

  const handleDelete = async () => {
    if (!selectedTransaction) return;
    try {
      setDeleteLoading(true);
      await deleteTransaction(selectedTransaction.id);
      setTransactions(prev =>
        prev.filter(transaction => transaction.id !== selectedTransaction.id)
      );
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

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterParams.personId) count++;
    if (filterParams.search) count++;
    if (filterParams.startDate) count++;
    if (filterParams.endDate) count++;
    if (filterParams.isMoneyReceived !== '') count++;
    if (filterParams.isSettled !== '') count++;
    if (filterParams.applyInterest !== '') count++;
    return count;
  }, [filterParams]);

  if (loading && transactions.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div
        className="flex flex-col md:flex-row justify-between items-center mb-8"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-800 mb-2">
            Transactions
          </h1>
          <p className="text-secondary-500">
            Track and manage all your financial activities
          </p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/transactions/new"
              className="btn btn-primary group"
            >
              <svg className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Transaction
            </Link>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            className="btn btn-success"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Export CSV
          </motion.button>
        </div>
      </motion.div>

      {error && (
        <motion.div variants={itemVariants}>
          <ErrorAlert message={error} />
        </motion.div>
      )}

      {/* Filter Card */}
      <motion.div
        className="bg-gradient-to-r from-primary-50 to-white rounded-xl shadow p-4 mb-6 sticky top-3 z-10"
        variants={itemVariants}
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-primary-800">
            Filter Transactions
          </h2>
          {activeFiltersCount > 0 && (
            <motion.span
              className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {activeFiltersCount} active
            </motion.span>
          )}
        </div>
        <SearchFilter
          params={filterParams}
          onChange={handleFilterChange}
          people={people}
          showInterestFilter={true}
        />
      </motion.div>

      {/* Summary Cards */}
      {transactions.length > 0 && (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          variants={itemVariants}
        >
          {/* ...stat cards as in your original code... */}
        </motion.div>
      )}

      {/* Interest Summary */}
      {showInterestColumn && (
        <motion.div
          className="bg-gradient-to-r from-primary-50 to-white rounded-xl shadow p-4 mb-6"
          variants={itemVariants}
        >
          {/* ...interest summary as in your original code... */}
        </motion.div>
      )}

      {/* Responsive Transactions Table */}
      <motion.div className="overflow-x-auto rounded-xl shadow bg-white" variants={itemVariants}>
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-primary-800 whitespace-nowrap cursor-pointer group" onClick={() => handleSort('transactionDate')}>
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  <svg className={`w-4 h-4 transition-transform duration-200 ${
                      filterParams.sortBy === 'transactionDate'
                        ? filterParams.sortOrder === 'ASC' ? 'rotate-180' : ''
                        : 'opacity-0 group-hover:opacity-50'
                    }`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-primary-800 whitespace-nowrap cursor-pointer group" onClick={() => handleSort('Person.name')}>
                <div className="flex items-center space-x-1">
                  <span>Person</span>
                  <svg className={`w-4 h-4 transition-transform duration-200 ${
                      filterParams.sortBy === 'Person.name'
                        ? filterParams.sortOrder === 'ASC' ? 'rotate-180' : ''
                        : 'opacity-0 group-hover:opacity-50'
                    }`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </th>
              <th className="px-4 py-3 text-right font-semibold text-primary-800 whitespace-nowrap cursor-pointer group" onClick={() => handleSort('amount')}>
                <div className="flex items-center justify-end space-x-1">
                  <span>Amount</span>
                  <svg className={`w-4 h-4 transition-transform duration-200 ${
                      filterParams.sortBy === 'amount'
                        ? filterParams.sortOrder === 'ASC' ? 'rotate-180' : ''
                        : 'opacity-0 group-hover:opacity-50'
                    }`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </th>
              {showInterestColumn && (
                <th className="px-4 py-3 text-right font-semibold text-primary-800 whitespace-nowrap">Interest</th>
              )}
              <th className="px-4 py-3 text-right font-semibold text-primary-800 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {noResults ? (
              <tr>
                <td colSpan={showInterestColumn ? 5 : 4} className="px-4 py-8">
                  <EmptyState
                    icon={
                      <svg className="w-16 h-16 text-secondary-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                      </svg>
                    }
                    title="No transactions found"
                    description="Try adjusting your filters or add a new transaction to get started."
                    actionLabel="Add Transaction"
                    actionLink="/transactions/new"
                  />
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {transactions.map((transaction, index) => {
                  let interestInfo = null;
                  if (transaction.applyInterest) {
                    const days = Math.floor((new Date() - new Date(transaction.transactionDate)) / (1000 * 60 * 60 * 24));
                    const amount = parseFloat(transaction.amount);
                    if (transaction.interestType === 'simple') {
                      const interestRate = parseFloat(transaction.interestRate || 0) / 100;
                      const interest = amount * interestRate * (days / 365);
                      interestInfo = { type: 'simple', amount: interest, days };
                    } else if (transaction.interestType === 'compound') {
                      const interestRate = parseFloat(transaction.interestRate || 0) / 100;
                      const compoundFrequency = parseInt(transaction.compoundFrequency || 12);
                      const years = days / 365;
                      const totalWithInterest = amount * Math.pow(1 + (interestRate / compoundFrequency), compoundFrequency * years);
                      const interest = totalWithInterest - amount;
                      interestInfo = { type: 'compound', amount: interest, days };
                    }
                  }
                  return (
                    <motion.tr
                      key={transaction.id}
                      className="group hover:bg-primary-50 transition cursor-pointer"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={e => {
                        // Prevent row click if edit/delete button is clicked
                        if (
                          e.target.closest('button') ||
                          e.target.closest('a')
                        ) return;
                        navigate(`/transactions/edit/${transaction.id}`);
                      }}
                    >
                      <td className="px-4 py-3 align-top whitespace-nowrap">
                        <span className="font-medium text-primary-900">{formatDate(transaction.transactionDate)}</span>
                      </td>
                      <td className="px-4 py-3 align-top whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="avatar-md bg-gradient-to-br from-primary-100 to-primary-200">
                            <span className="text-primary-700 font-semibold">
                              {transaction.Person.name[0].toUpperCase()}
                            </span>
                          </div>
                          <span className="text-primary-900 font-medium">
                            {transaction.Person.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-right whitespace-nowrap">
                        <span className={`font-semibold ${
                          transaction.isMoneyReceived ? 'text-success-600' : 'text-danger-600'
                        }`}>
                          {transaction.isMoneyReceived ? '+' : '-'} {formatCurrency(Math.abs(transaction.amount))}
                        </span>
                      </td>
                      {showInterestColumn && (
                        <td className="px-4 py-3 align-top text-right whitespace-nowrap">
                          {interestInfo ? (
                            <div className="flex flex-col items-end">
                              <span className={`font-medium text-sm ${
                                transaction.isMoneyReceived ? 'text-success-600' : 'text-danger-600'
                              }`}>
                                {transaction.isMoneyReceived ? '+' : '-'} {formatCurrency(Math.abs(interestInfo.amount))}
                              </span>
                              <span className="text-xs text-secondary-400">
                                {interestInfo.type === 'simple' ? 'Simple' : 'Compound'} • {interestInfo.days}d
                              </span>
                            </div>
                          ) : (
                            <span className="text-secondary-400">-</span>
                          )}
                        </td>
                      )}
                      <td className="px-4 py-3 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                navigate(`/transactions/edit/${transaction.id}`);
                              }}
                              className="icon-button-primary"
                              aria-label="Edit transaction"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                            </button>
                          </motion.div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedTransaction(transaction);
                              setShowDeleteDialog(true);
                            }}
                            className="icon-button text-danger-600 hover:bg-danger-50"
                            aria-label="Delete transaction"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Transaction"
        message={
          selectedTransaction
            ? <>
                <p className="text-secondary-700">Are you sure you want to delete this transaction?</p>
                <div className="mt-4 p-4 bg-secondary-50 rounded-xl">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-secondary-500 text-sm">Person:</span>
                      <span className="font-medium text-secondary-900">{selectedTransaction.Person?.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-secondary-500 text-sm">Date:</span>
                      <span className="font-medium text-secondary-900">{formatDate(selectedTransaction.transactionDate)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-secondary-500 text-sm">Amount:</span>
                      <span className={`font-medium ${selectedTransaction.isMoneyReceived ? 'text-success-600' : 'text-danger-600'}`}>
                        {selectedTransaction.isMoneyReceived ? '+' : '-'} {formatCurrency(Math.abs(selectedTransaction.amount))}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-danger-600 text-sm font-medium">This action cannot be undone.</p>
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
    </motion.div>
  );
};

export default TransactionList;
