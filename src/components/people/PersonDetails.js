// src/components/people/PersonDetails.js
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
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <div className="mb-6">
        <Link
          to="/people"
          className="inline-flex items-center text-primary-600 hover:text-primary-800"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to People
        </Link>
      </div>

      {/* Person Header */}
      <div className="card mb-6">
        <div className="md:flex items-center justify-between p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xl font-bold mr-4">
              {person.name[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">{person.name}</h1>
              <div className="flex flex-wrap items-center mt-1 text-secondary-500">
                {person.email && (
                  <a href={`mailto:${person.email}`} className="inline-flex items-center mr-4 hover:text-primary-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    {person.email}
                  </a>
                )}
                {person.phone && (
                  <a href={`tel:${person.phone}`} className="inline-flex items-center hover:text-primary-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    {person.phone}
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="space-x-3 mt-4 md:mt-0 flex flex-wrap">
            <Link
              to={`/transactions/new?personId=${person.id}`}
              className="btn btn-primary"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Transaction
            </Link>
            <Link
              to={`/people/edit/${person.id}`}
              className="btn btn-secondary"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              Edit Person
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

        {person.notes && (
          <div className="px-6 pb-6">
            <div className="bg-secondary-50 p-4 rounded-lg border border-secondary-200">
              <h3 className="font-medium text-secondary-700 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Notes
              </h3>
              <p className="text-secondary-700 whitespace-pre-line">{person.notes}</p>
            </div>
          </div>
        )}
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`stat-card ${
            summary.balance > 0
              ? 'border-l-4 border-success-500'
              : summary.balance < 0
                ? 'border-l-4 border-danger-500'
                : ''
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="stat-card-title">Current Balance</h3>
                <p className={`stat-card-value ${
                  summary.balance > 0
                    ? 'text-success-600'
                    : summary.balance < 0
                      ? 'text-danger-600'
                      : 'text-secondary-700'
                }`}>
                  {formatCurrency(summary.balance)}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${
                summary.balance > 0
                  ? 'bg-success-100 text-success-600'
                  : summary.balance < 0
                    ? 'bg-danger-100 text-danger-600'
                    : 'bg-secondary-100 text-secondary-500'
              }`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <div className="mt-2 text-sm text-secondary-500">
              {summary.balance > 0
                ? 'They owe you'
                : summary.balance < 0
                  ? 'You owe them'
                  : 'No outstanding balance'}
            </div>
          </div>

          <div className="stat-card bg-success-50">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="stat-card-title">You Received</h3>
                <p className="stat-card-value text-success-600">
                  {formatCurrency(summary.totalReceived)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-success-100 text-success-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
            </div>
            <div className="mt-2 text-sm text-secondary-500">
              {summary.receivedCount || 0} incoming transactions
            </div>
          </div>

          <div className="stat-card bg-danger-50">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="stat-card-title">You Gave</h3>
                <p className="stat-card-value text-danger-600">
                  {formatCurrency(summary.totalGiven)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-danger-100 text-danger-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                </svg>
              </div>
            </div>
            <div className="mt-2 text-sm text-secondary-500">
              {summary.givenCount || 0} outgoing transactions
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-secondary-200 mb-6">
        <button
          className={`py-3 px-5 font-medium ${
            activeTab === 'transactions'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-secondary-500 hover:text-secondary-700'
          }`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
        <button
          className={`py-3 px-5 font-medium ${
            activeTab === 'chart'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-secondary-500 hover:text-secondary-700'
          }`}
          onClick={() => setActiveTab('chart')}
        >
          Analytics
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'transactions' ? (
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h2 className="text-lg font-semibold text-secondary-900">Transaction History</h2>
            <span className="text-sm text-secondary-500">
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </span>
          </div>

          {transactions.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
              <p className="mt-4 text-secondary-500">No transactions found for this person.</p>
              <Link
                to={`/transactions/new?personId=${person.id}`}
                className="mt-4 btn btn-primary inline-flex"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add a transaction
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">
                      Date
                    </th>
                    <th className="table-header-cell">
                      Description
                    </th>
                    <th className="table-header-cell">
                      Category
                    </th>
                    <th className="table-header-cell text-right">
                      Amount
                    </th>
                    <th className="table-header-cell text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {transactions.map((transaction) => (
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
                        <div className="max-w-xs truncate">
                          {transaction.description || '-'}
                        </div>
                        {transaction.isSettled && (
                          <span className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                            Settled
                          </span>
                        )}
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-secondary-900">Transaction Analytics</h2>
          </div>
          <div className="card-body">
            {transactions.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <p className="mt-4 text-secondary-500">No transaction data available for analytics.</p>
                <p className="text-sm text-secondary-400">Add transactions to see charts and insights.</p>
              </div>
            ) : (
              <>
                <h3 className="text-md font-medium text-secondary-700 mb-4">Monthly Transaction History</h3>
                <div className="h-80 mb-6">
                  <PersonChart data={transactions} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-secondary-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-secondary-700 mb-2">Transaction Summary</h4>
                    <ul className="space-y-3">
                      <li className="flex justify-between">
                        <span className="text-secondary-600">Total Transactions:</span>
                        <span className="font-medium">{transactions.length}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-secondary-600">Money Received:</span>
                        <span className="font-medium text-success-600">{summary.receivedCount || 0}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-secondary-600">Money Given:</span>
                        <span className="font-medium text-danger-600">{summary.givenCount || 0}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-secondary-600">Settled Transactions:</span>
                        <span className="font-medium">{transactions.filter(t => t.isSettled).length}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-secondary-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-secondary-700 mb-2">Financial Summary</h4>
                    <ul className="space-y-3">
                      <li className="flex justify-between">
                        <span className="text-secondary-600">Highest Transaction:</span>
                        <span className="font-medium">{
                          formatCurrency(
                            Math.max(...transactions.map(t => Math.abs(t.amount)))
                          )
                        }</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-secondary-600">Average Transaction:</span>
                        <span className="font-medium">{
                          formatCurrency(
                            transactions.reduce((acc, t) => acc + Math.abs(t.amount), 0) / transactions.length
                          )
                        }</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-secondary-600">First Transaction:</span>
                        <span className="font-medium">{
                          formatDate(
                            transactions.reduce((earliest, t) => {
                              const date = new Date(t.transactionDate);
                              return date < earliest ? date : earliest;
                            }, new Date())
                          )
                        }</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-secondary-600">Latest Transaction:</span>
                        <span className="font-medium">{
                          formatDate(
                            transactions.reduce((latest, t) => {
                              const date = new Date(t.transactionDate);
                              return date > latest ? date : latest;
                            }, new Date(0))
                          )
                        }</span>
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
                <p>Are you sure you want to delete this transaction?</p>
                <div className="mt-2 p-3 bg-secondary-50 rounded-lg text-sm">
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