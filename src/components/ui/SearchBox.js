// src/components/ui/SearchBox.js
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SearchBox = ({
  value,
  onChange,
  placeholder = "Search...",
  suggestions = [],
  onSuggestionSelect,
  isLoading = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="search-box" ref={searchRef}>
      <div className="relative">
        <motion.div
          className="absolute left-3 top-1/2 transform -translate-y-1/2"
          animate={{
            scale: isFocused ? 1.1 : 1,
            rotate: isFocused ? 90 : 0
          }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </motion.div>

        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(true);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`search-input transition-all duration-200 ${
            isFocused ? 'ring-2 ring-primary-500 border-transparent' : ''
          }`}
        />

        {value && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={() => onChange('')}
            className="search-clear"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </motion.button>
        )}

        {isLoading && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
            <div className="spinner spinner-sm"></div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-secondary-200 overflow-hidden"
          >
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  onSuggestionSelect(suggestion);
                  setShowSuggestions(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors duration-150 flex items-center space-x-3"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-medium">
                      {suggestion.name[0].toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-secondary-900">{suggestion.name}</p>
                  {suggestion.subtitle && (
                    <p className="text-xs text-secondary-500">{suggestion.subtitle}</p>
                  )}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBox;