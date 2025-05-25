// src/components/ui/EmptyState.js
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionLink,
  onAction
}) => {
  return (
    <motion.div
      className="empty-state"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="empty-state-icon"
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        {Icon}
      </motion.div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {(actionLabel && (actionLink || onAction)) && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {actionLink ? (
            <Link to={actionLink} className="btn btn-primary">
              {actionLabel}
            </Link>
          ) : (
            <button onClick={onAction} className="btn btn-primary">
              {actionLabel}
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;