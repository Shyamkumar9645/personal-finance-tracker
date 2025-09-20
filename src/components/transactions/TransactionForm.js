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
    transactionDate: new Date().toISOString().split('T')[0],
    description: '',
    category: '',
    paymentMethod: '',
    isSettled: false,
    reminderDate: '',
    applyInterest: false,
    interestType: 'none',
    interestRate: '',
    compoundFrequency: '',
    interestStartDate: new Date().toISOString().split('T')[0], // Default to transactionDate
    interestEndDate: new Date().toISOString().split('T')[0], // Default to current date
  });

  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEdit] = useState(false); // Correctly define isEditing
  const [showInterestSettings, setShowInterestSettings] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // Pre-select person if personId is in URL
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const personId = query.get('personId');
    if (personId) {
      setFormData(prev => ({ ...prev, personId }));
    }
  }, [location]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setInitialLoading(true);
        const { people: peopleData } = await getPeople();
        setPeople(peopleData || []);
        if (id) {
          setIsEdit(true);
          const { transaction } = await getTransaction(id);
          const formattedTransaction = {
            ...transaction,
            transactionDate: new Date(transaction.transactionDate).toISOString().split('T')[0],
            reminderDate: transaction.reminderDate
              ? new Date(transaction.reminderDate).toISOString().split('T')[0]
              : '',
            applyInterest: transaction.applyInterest || false,
            interestType: transaction.interestType || 'none',
            interestRate: transaction.interestRate || '',
            compoundFrequency: transaction.compoundFrequency || ''
          };
          setFormData(formattedTransaction);
          if (formattedTransaction.applyInterest) setShowInterestSettings(true);
        }
      } catch (err) {
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
    if (name === 'applyInterest') {
      setShowInterestSettings(checked);
      if (!checked) setFormData(prev => ({ ...prev, interestType: 'none' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!formData.personId || !formData.amount || !formData.transactionDate) {
      setError('Please fill out all required fields');
      return;
    }
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
    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount),
      isMoneyReceived: !!formData.isMoneyReceived,
      isSettled: !!formData.isSettled,
      applyInterest: !!formData.applyInterest,
      interestRate: formData.interestRate ? parseFloat(formData.interestRate) : null,
      compoundFrequency: formData.compoundFrequency ? parseInt(formData.compoundFrequency) : null
    };
    try {
      setLoading(true);
      if (isEditing) {
        await updateTransaction(id, transactionData);
        setSuccess('Transaction updated successfully!');
      } else {
        await createTransaction(transactionData);
        setSuccess('Transaction added successfully!');
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
      setTimeout(() => {
        if (isEditing || !formData.personId) {
          navigate('/transactions');
        } else {
          navigate(`/people/${formData.personId}`);
        }
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <LoadingSpinner />;
  }

  const currentPersonName = formData.personId
    ? people.find(p => p.id === formData.personId)?.name || 'Selected Person'
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 transition-colors-ease">
      <div className="container mx-auto px-4 py-8 max-w-3xl animate-fade-in">
        <div className="glass rounded-3xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 overflow-hidden mb-8 animate-fade-in-down">
          <div className="px-8 py-6 border-b border-gray-100/50 dark:border-gray-700/50 bg-primary-50/30 dark:bg-gray-800/30 flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100/50 dark:bg-primary-900/50 rounded-xl flex items-center justify-center animate-glow">
              <span className="text-xl text-primary-600 dark:text-primary-400">{isEditing ? '✍️' : '✨'}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-700 dark:text-primary-300">{isEditing ? 'Edit Transaction' : 'Add New Transaction'}</h1>
              <p className="text-primary-500 dark:text-primary-400 text-sm">{isEditing ? 'Modify an existing financial record' : 'Create a new financial record'}</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="bg-red-50/50 dark:bg-red-900/50 border-l-4 border-red-500 p-4 mb-6 rounded-lg glass-border">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="personId" className="form-label text-secondary-700 dark:text-secondary-300">
                  Person*
                </label>
                <select
                  id="personId"
                  name="personId"
                  value={formData.personId}
                  onChange={handleChange}
                  required
                  className="form-select bg-white/50 dark:bg-gray-700/50 text-secondary-900 dark:text-secondary-100 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 transition-colors-ease glass-border"
                >
                  <option value="">Select a person</option>
                  {people.map(person => (
                    <option key={person.id} value={person.id}>{person.name}</option>
                  ))}
                </select>
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
                <label htmlFor="transactionDate" className="form-label text-secondary-700 dark:text-secondary-300">
                  Date*
                </label>
                <input
                  type="date"
                  id="transactionDate"
                  name="transactionDate"
                  value={formData.transactionDate}
                  onChange={handleChange}
                  required
                  className="form-input bg-white/50 dark:bg-gray-700/50 text-secondary-900 dark:text-secondary-100 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 transition-colors-ease glass-border"
                />
              </div>

              <div>
                <label htmlFor="isMoneyReceived" className="form-label text-secondary-700 dark:text-secondary-300">
                  Type*
                </label>
                <select
                  id="isMoneyReceived"
                  name="isMoneyReceived"
                  value={formData.isMoneyReceived}
                  onChange={handleChange}
                  required
                  className="form-select bg-white/50 dark:bg-gray-700/50 text-secondary-900 dark:text-secondary-100 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 transition-colors-ease glass-border"
                >
                  <option value="">Select type</option>
                  <option value="false">Money Given</option>
                  <option value="true">Money Received</option>
                </select>
              </div>

              <div>
                <label htmlFor="isSettled" className="form-label text-secondary-700 dark:text-secondary-300">
                  Status*
                </label>
                <select
                  id="isSettled"
                  name="isSettled"
                  value={formData.isSettled}
                  onChange={handleChange}
                  required
                  className="form-select bg-white/50 dark:bg-gray-700/50 text-secondary-900 dark:text-secondary-100 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 transition-colors-ease glass-border"
                >
                  <option value="">Select status</option>
                  <option value="false">Outstanding</option>
                  <option value="true">Settled</option>
                </select>
              </div>

              <div>
                <label htmlFor="interestRate" className="form-label text-secondary-700 dark:text-secondary-300">
                  Interest Rate (% per annum)
                </label>
                <input
                  type="number"
                  id="interestRate"
                  name="interestRate"
                  value={formData.interestRate}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="form-input bg-white/50 dark:bg-gray-700/50 text-secondary-900 dark:text-secondary-100 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 transition-colors-ease glass-border"
                  placeholder="e.g., 5.00"
                />
              </div>

              <div>
                <label htmlFor="interestStartDate" className="form-label text-secondary-700 dark:text-secondary-300">
                  Interest Start Date
                </label>
                <input
                  type="date"
                  id="interestStartDate"
                  name="interestStartDate"
                  value={formData.interestStartDate}
                  onChange={handleChange}
                  className="form-input bg-white/50 dark:bg-gray-700/50 text-secondary-900 dark:text-secondary-100 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 transition-colors-ease glass-border"
                />
              </div>

              <div>
                <label htmlFor="interestEndDate" className="form-label text-secondary-700 dark:text-secondary-300">
                  Interest End Date
                </label>
                <input
                  type="date"
                  id="interestEndDate"
                  name="interestEndDate"
                  value={formData.interestEndDate}
                  onChange={handleChange}
                  className="form-input bg-white/50 dark:bg-gray-700/50 text-secondary-900 dark:text-secondary-100 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 transition-colors-ease glass-border"
                />
              </div>

              <div>
                <label htmlFor="reminderDate" className="form-label text-secondary-700 dark:text-secondary-300">
                  Reminder Date
                </label>
                <input
                  type="date"
                  id="reminderDate"
                  name="reminderDate"
                  value={formData.reminderDate}
                  onChange={handleChange}
                  className="form-input bg-white/50 dark:bg-gray-700/50 text-secondary-900 dark:text-secondary-100 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 transition-colors-ease glass-border"
                />
              </div>

              <div>
                <label htmlFor="category" className="form-label text-secondary-700 dark:text-secondary-300">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-input bg-white/50 dark:bg-gray-700/50 text-secondary-900 dark:text-secondary-100 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 transition-colors-ease glass-border"
                  placeholder="e.g., Food, Transport, Loan"
                />
              </div>

              <div>
                <label htmlFor="paymentMethod" className="form-label text-secondary-700 dark:text-secondary-300">
                  Payment Method
                </label>
                <input
                  type="text"
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="form-input bg-white/50 dark:bg-gray-700/50 text-secondary-900 dark:text-secondary-100 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 transition-colors-ease glass-border"
                  placeholder="e.g., Cash, Bank Transfer, UPI"
                />
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="description" className="form-label text-secondary-700 dark:text-secondary-300">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="form-input bg-white/50 dark:bg-gray-700/50 text-secondary-900 dark:text-secondary-100 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 transition-colors-ease glass-border"
                placeholder="e.g., Loan for car, payment for rent, etc."
              ></textarea>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
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
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                    </svg>
                    {isEditing ? 'Update Transaction' : 'Add Transaction'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;