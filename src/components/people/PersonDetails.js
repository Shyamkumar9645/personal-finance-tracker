// PersonDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPerson, getPersonTransactions } from '../../api/peopleApi';
import { deleteTransaction, exportTransactions } from '../../api/transactionsApi';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';
import ConfirmDialog from '../ui/ConfirmDialog';
import PersonChart from './PersonChart';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

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

        const { transactions: transactionsData, summary: summaryData } =
          await getPersonTransactions(id);

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

  const calculateInterest = (transaction) => {
    if (!transaction.applyInterest) return null;

    const days = Math.floor((new Date() - new Date(transaction.transactionDate)) / (1000 * 60 * 60 * 24));
    const amount = parseFloat(transaction.amount);
    const interestRate = parseFloat(transaction.interestRate || 0) / 100;

    if (transaction.interestType === 'simple') {
      const interest = amount * interestRate * (days / 365);
      return { type: 'simple', amount: interest, days };
    }

    if (transaction.interestType === 'compound') {
      const compoundFrequency = parseInt(transaction.compoundFrequency || 12);
      const years = days / 365;
      const totalWithInterest = amount * Math.pow(1 + (interestRate / compoundFrequency), compoundFrequency * years);
      return { type: 'compound', amount: totalWithInterest - amount, days };
    }

    return null;
  };

  if (loading && !person) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!person) return <ErrorAlert message="Person not found" />;

  return (
    <motion.div
      className="container mx-auto px-4 py-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <Link to="/people" className="btn btn-ghost mb-6">
          ← Back to People
        </Link>
      </motion.div>

      {/* Person Header */}
      <motion.div variants={itemVariants} className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <div className="flex items-center gap-4">
            <div className="avatar placeholder">
              <div className="w-16 rounded-full bg-primary text-primary-content">
                <span className="text-2xl">{person.name[0].toUpperCase()}</span>
              </div>
            </div>
            <div>
              <h1 className="card-title text-3xl">{person.name}</h1>
              <div className="flex gap-4 mt-2">
                {person.email && (
                  <a href={`mailto:${person.email}`} className="link link-primary">
                    {person.email}
                  </a>
                )}
                {person.phone && (
                  <a href={`tel:${person.phone}`} className="link link-primary">
                    {person.phone}
                  </a>
                )}
              </div>
            </div>
          </div>
          {person.notes && (
            <div className="mt-4 p-4 bg-base-200 rounded-lg">
              <p className="text-sm whitespace-pre-line">{person.notes}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Transaction Table */}
      <motion.div variants={itemVariants} className="card bg-base-100 shadow-xl">
        <div className="card-body p-0">
          <div className="flex justify-between items-center p-6 pb-0">
            <h2 className="card-title">Transaction History</h2>
            <div className="flex gap-2">
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/transactions/new?personId=${person.id}`)}
              >
                + Add Transaction
              </button>
              <button className="btn btn-ghost" onClick={() => exportTransactions(id)}>
                Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Interest</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {transactions.map((transaction) => {
                    const interest = calculateInterest(transaction);
                    return (
                      <motion.tr
                        key={transaction.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <td>{formatDate(transaction.transactionDate)}</td>
                        <td className={`font-bold ${
                          transaction.isMoneyReceived ? 'text-success' : 'text-error'
                        }`}>
                          {transaction.isMoneyReceived ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td>
                          {interest ? (
                            <div className="badge badge-outline gap-1">
                              {interest.type === 'simple' ? 'S' : 'C'}
                              <span className="text-xs">
                                {formatCurrency(interest.amount)} ({interest.days}d)
                              </span>
                            </div>
                          ) : '-'}
                        </td>
                        <td className="text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              className="btn btn-xs btn-ghost"
                              onClick={() => navigate(`/transactions/edit/${transaction.id}`)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-xs btn-ghost text-error"
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setShowDeleteDialog(true);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction?"
        confirmText="Delete"
        onConfirm={handleDeleteTransaction}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </motion.div>
  );
};

export default PersonDetails;
