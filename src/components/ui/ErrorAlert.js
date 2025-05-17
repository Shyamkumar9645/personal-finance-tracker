// src/components/ui/ErrorAlert.js
import React from 'react';

const ErrorAlert = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative ${className}`}>
      <span className="block sm:inline">{message}</span>
    </div>
  );
};

export default ErrorAlert;