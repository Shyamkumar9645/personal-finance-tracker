import React, { useState, useEffect } from 'react';
import { createTransaction, updateTransaction } from '../services/api';
import { XIcon, SaveIcon } from '@heroicons/react/outline';

const TransactionForm = ({ transaction, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    person: '',
    amount: '',
    type: 'given',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEditing = !!transaction?._id;

  useEffect(() => {
    if (transaction) {
      setFormData({
        person: transaction.person || '',
        amount: transaction.amount ? transaction.amount.toString() : '',
        type: transaction.type || 'given',
        date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        notes: transaction.notes || ''
      });
    }
  }, [transaction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!formData.person || !formData.amount || !formData.date) {
      setError('Please fill in all required fields');
      return;
    }

    const numericAmount = parseFloat(formData.amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const data = {
        ...formData,
        amount: numericAmount
      };

      if (isEditing) {
        await updateTransaction(transaction._id, data);
      } else {
        await createTransaction(data);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Error saving transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass rounded-lg shadow-lg max-w-md w-full animate-scale-in border border-gray-100/50 dark:border-gray-700/50">
        <div className="flex justify-between items-center p-6 border-b border-gray-100/50 dark:border-gray-700/50 bg-primary-50/30 dark:bg-gray-800/30">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors-ease"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50/50 dark:bg-red-900/50 border-l-4 border-red-500 p-4 mb-6 rounded-lg glass-border">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="person" className="form-label text-secondary-700 dark:text-secondary-300">
                Person Name*
              </label>
              <input
                type="text"
                id="person"
                name="person"
                value={formData.person}
                onChange={handleChange}
                required
                className="form-input bg-white/50 dark:bg-gray-700/50 text-secondary-900 dark:text-secondary-100 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 transition-colors-ease glass-border"
                placeholder="Enter name"
              />
            </div>

            <div>
              <label htmlFor="amount" className="form-label text-secondary-700 dark:text-secondary-300">
                Amount*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">₹</span>
                </div>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  required
                  className="form-input pl-8 bg-white/50 dark:bg-gray-700/50 text-secondary-900 dark:text-secondary-100 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 transition-colors-ease glass-border"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="form-label text-secondary-700 dark:text-secondary-300">
                Transaction Type*
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="given"
                    checked={formData.type === 'given'}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-blue-600 dark:text-blue-400 transition-colors-ease"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Money Given</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="received"
                    checked={formData.type === 'received'}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-blue-600 dark:text-blue-400 transition-colors-ease"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Money Received</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="date" className="form-label text-secondary-700 dark:text-secondary-300">
                Date*
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="form-input bg-white/50 dark:bg-gray-700/50 text-secondary-900 dark:text-secondary-100 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 transition-colors-ease glass-border"
              />
            </div>

            <div>
              <label htmlFor="notes" className="form-label text-secondary-700 dark:text-secondary-300">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="form-input bg-white/50 dark:bg-gray-700/50 text-secondary-900 dark:text-secondary-100 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 transition-colors-ease glass-border"
                placeholder="Add notes about this transaction"
              ></textarea>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary bg-gray-200/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-300/50 dark:hover:bg-gray-600/50 transition-colors-ease glass-border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex items-center bg-primary-600 hover:bg-primary-700 text-white transition-colors-ease transform hover:scale-105"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <SaveIcon className="h-4 w-4 mr-1" />
                  {isEditing ? 'Update' : 'Save'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;