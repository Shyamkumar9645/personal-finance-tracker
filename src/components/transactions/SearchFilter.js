// src/components/transactions/SearchFilter.js
import React, { useState } from 'react';

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
    onChange('category', '');
    onChange('isSettled', '');
    if (showInterestFilter) {
      onChange('applyInterest', '');
    }
  };

  return (
    <div className="p-4">
      {/* Basic Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-secondary-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              name="search"
              value={params.search}
              onChange={handleChange}
              className="form-input pl-10"
              placeholder="Search transactions..."
            />
          </div>
        </div>
        <div className="w-full md:w-64">
          <select
            id="personId"
            name="personId"
            value={params.personId}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">All People</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="btn btn-secondary flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
          </svg>
          {isExpanded ? 'Less Filters' : 'More Filters'}
        </button>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="bg-secondary-50 rounded-lg p-4 mb-4 border border-secondary-200 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="isMoneyReceived" className="form-label">
                Transaction Type
              </label>
              <select
                id="isMoneyReceived"
                name="isMoneyReceived"
                value={params.isMoneyReceived}
                onChange={handleChange}
                className="form-input"
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
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={params.startDate}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="form-label">
                To Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={params.endDate}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="category" className="form-label">
                Category
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={params.category}
                onChange={handleChange}
                placeholder="Filter by category"
                className="form-input"
              />
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
                className="form-input"
              >
                <option value="">All Statuses</option>
                <option value="true">Settled</option>
                <option value="false">Unsettled</option>
              </select>
            </div>

            <div>
              <label htmlFor="sortOrder" className="form-label">
                Sort Order
              </label>
              <select
                id="sortOrder"
                name="sortOrder"
                value={params.sortOrder}
                onChange={handleChange}
                className="form-input"
              >
                <option value="DESC">Newest First</option>
                <option value="ASC">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Interest Filter - only show if interest filter is enabled */}
          {showInterestFilter && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="applyInterest" className="form-label">
                  Interest Bearing
                </label>
                <select
                  id="applyInterest"
                  name="applyInterest"
                  value={params.applyInterest}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">All Transactions</option>
                  <option value="true">Interest Bearing Only</option>
                  <option value="false">Non-Interest Bearing Only</option>
                </select>
              </div>

              {params.applyInterest === 'true' && (
                <div>
                  <label htmlFor="interestType" className="form-label">
                    Interest Type
                  </label>
                  <select
                    id="interestType"
                    name="interestType"
                    value={params.interestType || ''}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="">All Types</option>
                    <option value="simple">Simple Interest</option>
                    <option value="compound">Compound Interest</option>
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end">
        <button
          onClick={clearFilters}
          className="btn btn-secondary"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default SearchFilter;