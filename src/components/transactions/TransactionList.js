import React, { useState, useEffect } from 'react';
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
    isSettled: ''
  });

  // Load transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const { transactions } = await getTransactions(filterParams);
        setTransactions(transactions || []);
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

  if (loading && transactions.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
        <div className="space-x-4 mt-4 md:mt-0">
          <Link
            to="/transactions/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
          >
            Add Transaction
          </Link>
          <button
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md"
          >
            Export CSV
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <SearchFilter
          params={filterParams}
          onChange={handleFilterChange}
          people={people}
        />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('transactionDate')}
                >
                  Date
                  {filterParams.sortBy === 'transactionDate' && (
                    <span className="ml-1">
                      {filterParams.sortOrder === 'ASC' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('Person.name')}
                >
                  Person
                  {filterParams.sortBy === 'Person.name' && (
                    <span className="ml-1">
                      {filterParams.sortOrder === 'ASC' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('amount')}
                >
                  Amount
                  {filterParams.sortBy === 'amount' && (
                    <span className="ml-1">
                      {filterParams.sortOrder === 'ASC' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No transactions found. Try adjusting your filters or add a new transaction.
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.transactionDate)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Link
                        to={`/people/${transaction.Person.id}`}
                        className="text-blue-600 hover:text-blue-900 hover:underline text-sm font-medium"
                      >
                        {transaction.Person.name}
                      </Link>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.description || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.category || '-'}
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium text-right ${
                      transaction.isMoneyReceived ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.isMoneyReceived ? '+' : '-'} {formatCurrency(Math.abs(transaction.amount))}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/transactions/edit/${transaction.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowDeleteDialog(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
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