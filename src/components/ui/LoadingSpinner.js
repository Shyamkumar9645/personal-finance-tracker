// src/components/ui/LoadingSpinner.js
import React from 'react';

const LoadingSpinner = ({ size = 'lg', className = '' }) => {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }[size] || 'h-12 w-12';

  return (
    <div className={`flex justify-center items-center py-12 ${className}`}>
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-500 ${sizeClass}`}></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;