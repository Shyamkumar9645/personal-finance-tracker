// src/components/transactions/TransactionForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { createTransaction, getTransaction, updateTransaction } from '../../api/transactionsApi';
import { getPeople } from '../../api/peopleApi';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';

const TransactionForm = () => {
  const [formData, setFormData] = useState({
    personId: '',
    amount: '',
    isMoneyReceived: false,
    transactionDate: new Date().toISOString().split('T')[0], // Default to today
    description: '',
    category: '',
    paymentMethod: '',
    isSettled: false,
    reminderDate: '',
    // New interest fields
    applyInterest: false,
    interestType: 'none',
    interestRate: '',
    compoundFrequency: ''
  });

  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [showInterestSettings, setShowInterestSettings] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // Extract personId from URL query if available
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const personId = query.get('personId');
    if (personId) {
      setFormData(prev => ({ ...prev, personId }));
    }
  }, [location]);

  // Load people and transaction data if editing
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setInitialLoading(true);

        // Fetch people
        const { people: peopleData } = await getPeople();
        setPeople(peopleData || []);

        // If editing, fetch transaction
        if (id) {
          setIsEdit(true);
          const { transaction } = await getTransaction(id);

          // Format dates for form inputs
          const formattedTransaction = {
            ...transaction,
            transactionDate: new Date(transaction.transactionDate).toISOString().split('T')[0],
            reminderDate: transaction.reminderDate
              ? new Date(transaction.reminderDate).toISOString().split('T')[0]
              : '',
            // Interest fields
            applyInterest: transaction.applyInterest || false,
            interestType: transaction.interestType || 'none',
            interestRate: transaction.interestRate || '',
            compoundFrequency: transaction.compoundFrequency || ''
          };

          setFormData(formattedTransaction);

          // Show interest settings section if interest is applied
          if (formattedTransaction.applyInterest) {
            setShowInterestSettings(true);
          }
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // If turning on apply interest, show interest settings
    if (name === 'applyInterest' && checked) {
      setShowInterestSettings(true);
    }

    // If turning off apply interest, hide interest settings
    if (name === 'applyInterest' && !checked) {
      setShowInterestSettings(false);
    }

    // Set interestType to 'none' if interest is turned off
    if (name === 'applyInterest' && !checked) {
      setFormData(prev => ({
        ...prev,
        interestType: 'none'
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (!formData.personId || !formData.amount || !formData.transactionDate) {
      setError('Please fill out all required fields');
      return;
    }

    // Validate interest fields if interest is applied
    if (formData.applyInterest) {
      if (formData.interestType === 'none') {
        setError('Please select an interest type');
        return;
      }

      if (!formData.interestRate) {
        setError('Please enter an interest rate');
        return;
      }

      if (formData.interestType === 'compound' && !formData.compoundFrequency) {
        setError('Please enter a compound frequency');
        return;
      }
    }

    // Prepare data for submission
    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount)
    };

    try {
      setLoading(true);

      if (isEdit) {
        await updateTransaction(id, transactionData);
        setSuccess('Transaction updated successfully!');
      } else {
        await createTransaction(transactionData);
        setSuccess('Transaction added successfully!');

        // Reset form if not editing
        if (!isEdit) {
          setFormData({
            ...formData,
            amount: '',
            description: '',
            category: '',
            paymentMethod: '',
            isSettled: false,
            reminderDate: '',
            applyInterest: false,
            interestType: 'none',
            interestRate: '',
            compoundFrequency: ''
          });

          setShowInterestSettings(false);
        }
      }

      // Redirect after a short delay to show success message
      setTimeout(() => {
        if (isEdit || !formData.personId) {
          navigate('/transactions');
        } else {
          // If adding from person details, go back to that person
          navigate(`/people/${formData.personId}`);
        }
      }, 1500);
    } catch (err) {
      console.error('Error saving transaction:', err);
      setError(err.response?.data?.error || 'Failed to save transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <LoadingSpinner />;
  }

  // Get current person name
  const currentPersonName = formData.personId
    ? people.find(p => p.id === formData.personId)?.name || 'Selected Person'
    : '';

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-primary-600 hover:text-primary-800"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back
        </button>
      </div>

      <div className="card max-w-3xl mx-auto">
        <div className="card-header">
          <h1 className="text-xl font-bold text-secondary-900">
            {isEdit ? 'Edit Transaction' : 'Add New Transaction'}
          </h1>
          {formData.personId && (
            <p className="text-secondary-500 mt-1">
              For <span className="font-medium text-secondary-700">{currentPersonName}</span>
            </p>
          )}
        </div>

        {error && <ErrorAlert message={error} className="mx-6 mt-6" />}

        {success && (
          <div className="mx-6 mt-6 bg-success-50 border-l-4 border-success-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-success-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-success-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="personId" className="form-label">
                Person <span className="text-danger-500">*</span>
              </label>
              <select
                id="personId"
                name="personId"
                value={formData.personId}
                onChange={handleChange}
                required
                className="form-input"
                disabled={!!location.search.includes('personId=')}
              >
                <option value="">Select a person</option>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
              {people.length === 0 && (
                <p className="mt-1 text-xs text-danger-600">
                  No people found. Please add a person first.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="transactionDate" className="form-label">
                Transaction Date <span className="text-danger-500">*</span>
              </label>
              <input
                type="date"
                id="transactionDate"
                name="transactionDate"
                value={formData.transactionDate}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="amount" className="form-label">
                Amount <span className="text-danger-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-secondary-500">$</span>
                </div>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="0.01"
                  step="0.01"
                  className="form-input pl-8"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="form-label mb-3">
                Transaction Type <span className="text-danger-500">*</span>
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="isMoneyReceived"
                    checked={formData.isMoneyReceived === true}
                    onChange={() => setFormData(prev => ({ ...prev, isMoneyReceived: true }))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded-full"
                  />
                  <span className="ml-2 text-sm text-secondary-700">
                    <span className="font-medium text-success-600">Money Received</span>
                    <span className="ml-1 text-xs text-secondary-500">(they paid you)</span>
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="isMoneyReceived"
                    checked={formData.isMoneyReceived === false}
                    onChange={() => setFormData(prev => ({ ...prev, isMoneyReceived: false }))}
                    className="h-4 w-4 text-danger-600 focus:ring-danger-500 border-secondary-300 rounded-full"
                  />
                  <span className="ml-2 text-sm text-secondary-700">
                    <span className="font-medium text-danger-600">Money Given</span>
                    <span className="ml-1 text-xs text-secondary-500">(you paid them)</span>
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="category" className="form-label">
                Category
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. Lunch, Rent, Travel"
              />
            </div>

            <div>
              <label htmlFor="paymentMethod" className="form-label">
                Payment Method
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Select a payment method</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Digital Wallet">Digital Wallet</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isSettled"
                name="isSettled"
                checked={formData.isSettled}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
              <label htmlFor="isSettled" className="ml-2 text-sm text-secondary-700">
                This transaction is settled (debt is paid)
              </label>
            </div>

            <div>
              <label htmlFor="reminderDate" className="form-label flex items-center">
                <span>Reminder Date</span>
                <span className="ml-2 text-xs text-secondary-500">(Optional)</span>
              </label>
              <input
                type="date"
                id="reminderDate"
                name="reminderDate"
                value={formData.reminderDate}
                onChange={handleChange}
                className="form-input"
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="mt-1 text-xs text-secondary-500">Set a date to remind yourself about this transaction</p>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="form-input"
              placeholder="Add notes about this transaction"
            ></textarea>
          </div>

          {/* Interest section */}
          <div className="border-t border-secondary-200 pt-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="applyInterest"
                  name="applyInterest"
                  checked={formData.applyInterest}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                />
                <label htmlFor="applyInterest" className="ml-2 text-sm font-medium text-secondary-700">
                  Apply Interest to this Transaction
                </label>
              </div>
              {formData.applyInterest && (
                <button
                  type="button"
                  onClick={() => setShowInterestSettings(!showInterestSettings)}
                  className="text-sm text-primary-600"
                >
                  {showInterestSettings ? 'Hide Interest Settings' : 'Show Interest Settings'}
                </button>
              )}
            </div>

            {formData.applyInterest && showInterestSettings && (
              <div className="bg-secondary-50 p-4 rounded-lg border border-secondary-200 animate-fade-in">
                <h3 className="text-md font-medium text-secondary-700 mb-4">Interest Settings</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="interestType" className="form-label">
                      Interest Type <span className="text-danger-500">*</span>
                    </label>
                    <select
                      id="interestType"
                      name="interestType"
                      value={formData.interestType}
                      onChange={handleChange}
                      className="form-input"
                      required={formData.applyInterest}
                    >
                      <option value="none">Select interest type</option>
                      <option value="simple">Simple Interest</option>
                      <option value="compound">Compound Interest</option>
                    </select>
                    {formData.interestType === 'simple' && (
                      <p className="mt-1 text-xs text-secondary-500">
                        Simple interest is calculated only on the principal amount.
                      </p>
                    )}
                    {formData.interestType === 'compound' && (
                      <p className="mt-1 text-xs text-secondary-500">
                        Compound interest is calculated on the principal amount and the accumulated interest.
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="interestRate" className="form-label">
                      Annual Interest Rate (%) <span className="text-danger-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="interestRate"
                      name="interestRate"
                      value={formData.interestRate}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      placeholder="e.g. 10.00"
                      className="form-input"
                      required={formData.applyInterest}
                    />
                    <p className="mt-1 text-xs text-secondary-500">
                      Enter the annual interest rate as a percentage (e.g., 10 for 10%)
                    </p>
                  </div>

                  {formData.interestType === 'compound' && (
                    <div>
                      <label htmlFor="compoundFrequency" className="form-label">
                        Compound Frequency <span className="text-danger-500">*</span>
                      </label>
                      <select
                        id="compoundFrequency"
                        name="compoundFrequency"
                        value={formData.compoundFrequency}
                        onChange={handleChange}
                        className="form-input"
                        required={formData.interestType === 'compound'}
                      >
                        <option value="">Select frequency</option>
                        <option value="1">Annually (1/year)</option>
                        <option value="2">Semi-Annually (2/year)</option>
                        <option value="4">Quarterly (4/year)</option>
                        <option value="12">Monthly (12/year)</option>
                        <option value="365">Daily (365/year)</option>
                      </select>
                      <p className="mt-1 text-xs text-secondary-500">
                        How often the interest is compounded per year
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex items-center"
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
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  {isEdit ? 'Update Transaction' : 'Save Transaction'}
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