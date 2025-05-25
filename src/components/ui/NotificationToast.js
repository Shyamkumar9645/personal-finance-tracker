// src/components/ui/NotificationToast.js
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationToast = ({
  type = 'info',
  title,
  message,
  onClose,
  duration = 5000
}) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    ),
    error: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    ),
    warning: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
      </svg>
    ),
    info: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    )
  };

  const colors = {
    success: 'bg-success-50 text-success-800 border-success-200',
    error: 'bg-danger-50 text-danger-800 border-danger-200',
    warning: 'bg-warning-50 text-warning-800 border-warning-200',
    info: 'bg-primary-50 text-primary-800 border-primary-200'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        className="pointer-events-auto"
      >
        <div className={`max-w-sm w-full bg-white rounded-xl shadow-lg border ${colors[type]} overflow-hidden`}>
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {icons[type]}
              </div>
              <div className="ml-3 w-0 flex-1">
                {title && (
                  <p className="text-sm font-medium">
                    {title}
                  </p>
                )}
                {message && (
                  <p className="mt-1 text-sm">
                    {message}
                  </p>
                )}
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  onClick={onClose}
                  className="inline-flex text-secondary-400 hover:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <motion.div
            className="h-1 bg-current opacity-20"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: duration / 1000, ease: "linear" }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationToast;