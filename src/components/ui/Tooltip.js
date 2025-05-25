// src/components/ui/Tooltip.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Tooltip = ({
  children,
  content,
  position = 'top',
  delay = 0
}) => {
  const [isVisible, setIsVisible] = useState(false);
  let timeout;

  const handleMouseEnter = () => {
    timeout = setTimeout(() => setIsVisible(true), delay);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeout);
    setIsVisible(false);
  };

  const positions = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const arrowPositions = {
    top: 'top-full left-1/2 transform -translate-x-1/2',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 rotate-180',
    left: 'left-full top-1/2 transform -translate-y-1/2 -rotate-90',
    right: 'right-full top-1/2 transform -translate-y-1/2 rotate-90'
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 ${positions[position]}`}
          >
            <div className="bg-secondary-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
              {content}
              <div className={`absolute w-2 h-2 bg-secondary-900 transform rotate-45 ${arrowPositions[position]}`} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;