import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transition } from '@headlessui/react';

const SearchFilter = ({ params, onChange, people, showInterestFilter = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const clearFilters = () => {
    onChange('search', '');
    onChange('personId', '');
    onChange('startDate', '');
    onChange('endDate', '');
    onChange('isMoneyReceived', '');
    onChange('isSettled', '');
    if (showInterestFilter) {
      onChange('applyInterest', '');
    }
  };

  const hasActiveFilters = params.search || params.personId || params.startDate ||
                         params.endDate || params.isMoneyReceived !== '' ||
                         params.isSettled !== '' || params.applyInterest !== '';

  return (
    <div className="p-6">
      {/* Basic Search */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <div className="flex-1">
          <div className="search-box">
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input
              type="text"
              name="search"
              value={params.search}
              onChange={handleChange}
              className="search-input"
              placeholder="Search by description, amount..."
            />
            {params.search && (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                onClick={() => onChange('search', '')}
                className="search-clear"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </motion.button>
            )}
          </div>
        </div>

        <div className="w-full lg:w-64">
          <select
            id="personId"
            name="personId"
            value={params.personId}
            onChange={handleChange}
            className="form-select"
          >
            <option value="">All People</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </div>

        <motion.button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="btn btn-secondary group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg
            className={`w-4 h-4 mr-2 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
          </svg>
          {isExpanded ? 'Less Filters' : 'More Filters'}
        </motion.button>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-br from-secondary-50 to-white rounded-xl p-6 mb-4 border border-secondary-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="isMoneyReceived" className="form-label">
                    Transaction Type
                  </label>
                  <select
                    id="isMoneyReceived"
                    name="isMoneyReceived"
                    value={params.isMoneyReceived}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">All Types</option>
                    <option value="true">Money Received</option>
                    <option value="false">Money Given</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="startDate" className="form-label">
                    From Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={params.startDate}
                      onChange={handleChange}
                      className="form-input pl-10"
                    />
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                </div>

                <div>
                  <label htmlFor="endDate" className="form-label">
                    To Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={params.endDate}
                      onChange={handleChange}
                      className="form-input pl-10"
                    />
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                </div>

                <div>
                  <label htmlFor="isSettled" className="form-label">
                    Settlement Status
                  </label>
                  <select
                    id="isSettled"
                    name="isSettled"
                    value={params.isSettled}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">All Statuses</option>
                    <option value="true">Settled</option>
                    <option value="false">Unsettled</option>
                  </select>
                </div>

                {showInterestFilter && (
                  <div>
                    <label htmlFor="applyInterest" className="form-label">
                      Interest Status
                    </label>
                    <select
                      id="applyInterest"
                      name="applyInterest"
                      value={params.applyInterest}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="">All Transactions</option>
                      <option value="true">With Interest</option>
                      <option value="false">Without Interest</option>
                    </select>
                  </div>
                )}

                <div>
                  <label htmlFor="sortOrder" className="form-label">
                    Sort Order
                  </label>
                  <select
                    id="sortOrder"
                    name="sortOrder"
                    value={params.sortOrder}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="DESC">Newest First</option>
                    <option value="ASC">Oldest First</option>
                  </select>
                </div>
              </div>

              {/* Interest Type Filter */}
              {showInterestFilter && params.applyInterest === 'true' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="interestType" className="form-label">
                        Interest Type
                      </label>
                      <select
                        id="interestType"
                        name="interestType"
                        value={params.interestType || ''}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="">All Types</option>
                        <option value="simple">Simple Interest</option>
                        <option value="compound">Compound Interest</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      {hasActiveFilters && (
        <motion.div
          className="flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={clearFilters}
            className="btn btn-ghost text-danger-600 hover:bg-danger-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Clear All Filters
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default SearchFilter;