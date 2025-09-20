import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../../api/authApi';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';

const Profile = () => {
  const { currentUser, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || ''
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { user } = await updateProfile(formData);
      updateUser(user);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(
        err.response?.data?.error || 'Failed to update profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Your Profile</h1>

      {error && <ErrorAlert message={error} className="mb-4" />}

      {success && (
        <div className="bg-green-100/50 dark:bg-green-900/50 border border-green-400/50 dark:border-green-600/50 text-green-700 dark:text-green-300 px-4 py-3 rounded-md mb-4 glass-border">
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      <div className="glass rounded-lg shadow-xl p-6 mb-8 border border-gray-100/50 dark:border-gray-700/50 animate-fade-in-up">
        <div className="mb-4 border-b border-gray-100/50 dark:border-gray-700/50 pb-4">
          <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Account Information</h2>
          <p className="text-gray-500 dark:text-gray-400">Email: {currentUser.email}</p>
          <p className="text-gray-500 dark:text-gray-400">
            Account Status: {currentUser.isVerified ? 'Verified' : 'Not Verified'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Personal Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 transition-colors-ease glass-border"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 transition-colors-ease glass-border"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors-ease transform hover:scale-105 ${
                loading ? 'bg-primary-400' : ''
              }`}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;