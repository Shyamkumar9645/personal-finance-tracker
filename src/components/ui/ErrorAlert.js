// src/components/ui/ErrorAlert.js
import React from 'react';

const ErrorAlert = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`bg-danger-50 border-l-4 border-danger-500 p-4 rounded-md mb-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-danger-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-danger-700">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorAlert;