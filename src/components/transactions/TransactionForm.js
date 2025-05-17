import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
    reminderDate: ''
  });

  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  // Load people and transaction data if editing
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

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
              : ''
          };

          setFormData(formattedTransaction);
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!formData.personId || !formData.amount || !formData.transactionDate) {
      setError('Please fill out all required fields');
      return;
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
      } else {
        await createTransaction(transactionData);
      }

      // Redirect back to transactions list
      navigate('/transactions');
    } catch (err) {
      console.error('Error saving transaction:', err);
      setError(err.response?.data?.error || 'Failed to save transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.personId) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdit ? 'Edit Transaction' : 'Add New Transaction'}
      </h1>

      {error && <ErrorAlert message={error} className="mb-6" />}

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="personId" className="block text-sm font-medium text-gray-700 mb-1">
                Person <span className="text-red-500">*</span>
              </label>
              <select
                id="personId"
                name="personId"
                value={formData.personId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a person</option>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="transactionDate" className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="transactionDate"
                name="transactionDate"
                value={formData.transactionDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0.01"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Transaction Type <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="typeReceived"
                    name="isMoneyReceived"
                    checked={formData.isMoneyReceived === true}
                    onChange={() => setFormData(prev => ({ ...prev, isMoneyReceived: true }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="typeReceived" className="ml-2 text-sm text-gray-700">
                    Money Received
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="typeGiven"
                    name="isMoneyReceived"
                    checked={formData.isMoneyReceived === false}
                    onChange={() => setFormData(prev => ({ ...prev, isMoneyReceived: false }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="typeGiven" className="ml-2 text-sm text-gray-700">
                    Money Given
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <input
                type="text"
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isSettled"
                name="isSettled"
                checked={formData.isSettled}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isSettled" className="ml-2 text-sm text-gray-700">
                This transaction is settled (debt is paid)
              </label>
            </div>

            <div>
              <label htmlFor="reminderDate" className="block text-sm font-medium text-gray-700 mb-1">
                Reminder Date (Optional)
              </label>
              <input
                type="date"
                id="reminderDate"
                name="reminderDate"
                value={formData.reminderDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/transactions')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`${
                loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } text-white font-medium py-2 px-4 rounded-md`}
            >
              {loading ? 'Saving...' : isEdit ? 'Update Transaction' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;