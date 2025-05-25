// src/components/ui/LoadingSpinner.js
import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'lg', className = '', fullScreen = false }) => {
  const sizeClass = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  }[size] || 'h-16 w-16';

  const content = (
    <div className={`flex flex-col items-center justify-center ${fullScreen ? 'min-h-screen' : 'py-12'} ${className}`}>
      <motion.div
        className={`relative ${sizeClass}`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="absolute inset-0 rounded-full border-4 border-primary-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 animate-spin"></div>
      </motion.div>
      <motion.p
        className="mt-4 text-secondary-500 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Loading...
      </motion.p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;