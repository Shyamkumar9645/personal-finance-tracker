// frontend/src/components/people/PersonDetails.js
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
  const { id } = useParams();
  const navigate = useNavigate();

  // Load person data and transactions
  useEffect(() => {
    const fetchPersonData = async () => {
      try {
        setLoading(true);

        // Get basic person details
        const { person: personData } = await getPerson(id);
        setPerson(personData);

        // Get person transactions
        const { person: personWithTransactions, transactions: transactionsData, summary: summaryData } =
          await getPersonTransactions(id);

        setTransactions(transactionsData || []);
        setSummary(summaryData);
      } catch (err) {
        console.error('Error fetching person data:', err);
        setError('Failed to load person data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPersonData();
  }, [id]);

  // Handle transaction deletion
  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return;

    try {
      setDeleteLoading(true);
      await deleteTransaction(selectedTransaction.id);

      // Remove from state
      setTransactions(prev =>
        prev.filter(transaction => transaction.id !== selectedTransaction.id)
      );

      // Update summary
      const amount = parseFloat(selectedTransaction.amount);
      setSummary(prev => {
        const newSummary = { ...prev };

        if (selectedTransaction.isMoneyReceived) {
          newSummary.totalReceived -= amount;
          newSummary.balance -= amount;
        } else {
          newSummary.totalGiven -= amount;
          newSummary.balance += amount;
        }

        newSummary.transactionCount -= 1;

        return newSummary;
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
      exportTransactions(id);
    } catch (err) {
      console.error('Error exporting transactions:', err);
      setError('Failed to export transactions. Please try again.');
    }
  };

  if (loading && !person) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  if (!person) {
    return <ErrorAlert message="Person not found" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-1">
        <Link
          to="/people"
          className="text-blue-600 hover:text-blue-800 mr-2"
        >
          ← Back to People
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{person.name}</h1>
          {(person.email || person.phone) && (
            <div className="mt-1 text-gray-500">
              {person.email && (
                <div>
                  <a href={`mailto:${person.email}`} className="hover:underline">
                    {person.email}
                  </a>
                </div>
              )}
              {person.phone && (
                <div>
                  <a href={`tel:${person.phone}`} className="hover:underline">
                    {person.phone}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-x-3 mt-4 md:mt-0">
          <Link
            to={`/transactions/new?personId=${person.id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
          >
            Add Transaction
          </Link>
          <Link
            to={`/people/edit/${person.id}`}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md"
          >
            Edit Person
          </Link>
          <button
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md"
          >
            Export CSV
          </button>
        </div>
      </div>

      {person.notes && (
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-6">
          <h3 className="font-medium text-gray-700 mb-1">Notes</h3>
          <p className="text-gray-600">{person.notes}</p>
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`p-6 rounded-lg shadow-md bg-white ${
            summary.balance > 0
              ? 'border-l-4 border-green-500'
              : summary.balance < 0
                ? 'border-l-4 border-red-500'
                : ''
          }`}>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Current Balance</h3>
            <p className={`text-2xl font-bold ${
              summary.balance > 0
                ? 'text-green-600'
                : summary.balance < 0
                  ? 'text-red-600'
                  : 'text-gray-800'
            }`}>
              {formatCurrency(summary.balance)}
            </p>
          </div>

          <div className="p-6 rounded-lg shadow-md bg-white">
            <h3 className="text-lg font-medium text-gray-700 mb-2">You Received</h3>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalReceived)}
            </p>
          </div>

          <div className="p-6 rounded-lg shadow-md bg-white">
            <h3 className="text-lg font-medium text-gray-700 mb-2">You Gave</h3>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.totalGiven)}
            </p>
          </div>
        </div>
      )}

      {/* Transaction history */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Transaction History</h2>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No transactions found for this person.</p>
            <Link
              to={`/transactions/new?personId=${person.id}`}
              className="mt-4 inline-block text-blue-600 hover:text-blue-800"
            >
              Add a transaction
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.transactionDate)}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteTransaction}
        onCancel={() => {
          setShowDeleteDialog(false);
          setSelectedTransaction(null);
        }}
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default PersonDetails;