// src/components/ui/ProgressBar.js
import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  color = 'primary',
  size = 'md',
  animated = true
}) => {
  const percentage = (value / max) * 100;

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    success: 'from-success-500 to-success-600',
    danger: 'from-danger-500 to-danger-600',
    warning: 'from-warning-500 to-warning-600'
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-secondary-700">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-medium text-secondary-600">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className={`progress ${sizeClasses[size]}`}>
        <motion.div
          className={`progress-bar bg-gradient-to-r ${colorClasses[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: animated ? 1 : 0,
            ease: "easeOut",
            delay: 0.2
          }}
        >
          {animated && (
            <div className="h-full bg-white/20 animate-shimmer" />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressBar;