import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../api/authApi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await forgotPassword(email);
      setSuccess(
        'If your email is registered, you will receive a password reset link shortly.'
      );
      setEmail('');
    } catch (err) {
      setError(
        err.response?.data?.error || 'Password reset request failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 transition-colors-ease py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass p-8 rounded-lg shadow-xl border border-gray-100/50 dark:border-gray-700/50 animate-fade-in-up">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors-ease"
            >
              sign in to your account
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-100/50 dark:bg-red-900/50 border border-red-400/50 dark:border-red-600/50 text-red-700 dark:text-red-300 px-4 py-3 rounded relative glass-border">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-100/50 dark:bg-green-900/50 border border-green-400/50 dark:border-green-600/50 text-green-700 dark:text-green-300 px-4 py-3 rounded relative glass-border">
            <span className="block sm:inline">{success}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white/50 dark:bg-gray-700/50 transition-colors-ease glass-border"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all-ease transform hover:scale-105 ${
                loading ? 'bg-primary-400' : 'bg-primary-600 hover:bg-primary-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;