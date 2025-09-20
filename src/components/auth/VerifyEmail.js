import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../../api/authApi';
import LoadingSpinner from '../ui/LoadingSpinner';

const VerifyEmail = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUserEmail = async () => {
      if (!token) {
        setError('Invalid or missing verification token.');
        setLoading(false);
        return;
      }

      try {
        await verifyEmail(token);
        setSuccess('Email verified successfully! You can now log in.');

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err) {
        setError(
          err.response?.data?.error || 'Email verification failed. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    verifyUserEmail();
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 transition-colors-ease">
        <div className="max-w-md w-full space-y-8 glass p-8 rounded-lg shadow-xl border border-gray-100/50 dark:border-gray-700/50 animate-fade-in-up">
          <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
            Verifying your email...
          </h2>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 transition-colors-ease py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass p-8 rounded-lg shadow-xl border border-gray-100/50 dark:border-gray-700/50 animate-fade-in-up">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Email Verification
          </h2>
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

        <div className="text-center mt-4">
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500 transition-colors-ease"
          >
            Go to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;