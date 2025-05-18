// src/components/interest/InterestCalculator.js
import React, { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';

const InterestCalculator = ({ transaction, interestDetails }) => {
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [calculatedInterest, setCalculatedInterest] = useState(null);

  useEffect(() => {
    if (interestDetails) {
      setCalculatedInterest(interestDetails);
    }
  }, [interestDetails]);

  // Function to calculate days between two dates
  const calculateDaysBetween = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!transaction) {
    return <div className="text-secondary-500 italic">No transaction data available</div>;
  }

  // If transaction doesn't have interest applied
  if (!transaction.applyInterest) {
    return (
      <div className="bg-secondary-50 p-6 rounded-lg border border-secondary-200">
        <div className="text-center">
          <svg className="w-12 h-12 text-secondary-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className="text-secondary-600 font-medium">Interest Not Applied</p>
          <p className="text-secondary-500 mt-1">This transaction does not have interest calculations applied.</p>
        </div>
      </div>
    );
  }

  // If we have no calculated interest data yet
  if (!calculatedInterest) {
    return (
      <div className="bg-secondary-50 p-6 rounded-lg border border-secondary-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600 mx-auto mb-3"></div>
          <p className="text-secondary-600 font-medium">Calculating Interest...</p>
        </div>
      </div>
    );
  }

  const { simpleInterest, compoundInterest } = calculatedInterest;
  const principal = parseFloat(transaction.amount);
  const interestType = transaction.interestType;
  const interestRate = parseFloat(transaction.interestRate);
  const compoundFrequency = parseInt(transaction.compoundFrequency);
  const transactionDate = new Date(transaction.transactionDate);
  const daysSinceTransaction = calculateDaysBetween(transactionDate, new Date(asOfDate));

  return (
    <div className="bg-secondary-50 p-6 rounded-lg border border-secondary-200">
      <h3 className="text-lg font-semibold text-secondary-900 mb-4">Interest Calculator</h3>

      {/* Transaction Info */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-secondary-500">Principal Amount</p>
            <p className="text-lg font-semibold text-secondary-900">{formatCurrency(principal)}</p>
          </div>
          <div>
            <p className="text-sm text-secondary-500">Transaction Date</p>
            <p className="text-lg font-semibold text-secondary-900">{formatDate(transactionDate)}</p>
          </div>
          <div>
            <p className="text-sm text-secondary-500">Days Elapsed</p>
            <p className="text-lg font-semibold text-secondary-900">{daysSinceTransaction}</p>
          </div>
        </div>
      </div>

      {/* Interest Settings Info */}
      <div className="mb-6 border-t border-secondary-200 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-secondary-500">Interest Type</p>
            <p className="text-lg font-semibold text-secondary-900">
              {interestType === 'simple' ? 'Simple Interest' : 'Compound Interest'}
            </p>
          </div>
          <div>
            <p className="text-sm text-secondary-500">Annual Interest Rate</p>
            <p className="text-lg font-semibold text-secondary-900">{interestRate}%</p>
          </div>
          {interestType === 'compound' && (
            <div>
              <p className="text-sm text-secondary-500">Compound Frequency</p>
              <p className="text-lg font-semibold text-secondary-900">
                {compoundFrequency === 1
                  ? 'Annually'
                  : compoundFrequency === 2
                    ? 'Semi-Annually'
                    : compoundFrequency === 4
                      ? 'Quarterly'
                      : compoundFrequency === 12
                        ? 'Monthly'
                        : compoundFrequency === 365
                          ? 'Daily'
                          : `${compoundFrequency}/year`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* "As of" Date Selector */}
      <div className="mb-6 border-t border-secondary-200 pt-4">
        <label htmlFor="asOfDate" className="block text-sm font-medium text-secondary-700 mb-1">
          Calculate Interest as of:
        </label>
        <input
          type="date"
          id="asOfDate"
          name="asOfDate"
          value={asOfDate}
          onChange={(e) => setAsOfDate(e.target.value)}
          className="form-input w-full md:w-auto"
          min={transactionDate.toISOString().split('T')[0]}
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Interest Calculation Results */}
      <div className="mb-6 border-t border-secondary-200 pt-4">
        <h4 className="text-md font-medium text-secondary-800 mb-4">Interest Calculation Results</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Simple Interest Card */}
          <div className={`card p-4 ${interestType === 'simple' ? 'border-l-4 border-primary-500' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <h5 className="text-md font-medium text-secondary-900">Simple Interest</h5>
                <p className="text-xs text-secondary-500 mt-1">P × r × t</p>
              </div>
              {interestType === 'simple' && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary-100 text-primary-800">
                  Selected
                </span>
              )}
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-secondary-500">Interest Amount:</span>
                <span className="text-sm font-medium text-secondary-900">
                  {formatCurrency(simpleInterest.interestAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary-500">Total with Interest:</span>
                <span className="text-sm font-medium text-secondary-900">
                  {formatCurrency(simpleInterest.totalWithInterest)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary-500">Effective Rate:</span>
                <span className="text-sm font-medium text-secondary-900">
                  {((simpleInterest.interestAmount / principal) * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Compound Interest Card */}
          <div className={`card p-4 ${interestType === 'compound' ? 'border-l-4 border-primary-500' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <h5 className="text-md font-medium text-secondary-900">Compound Interest</h5>
                <p className="text-xs text-secondary-500 mt-1">P(1 + r/n)^(nt)</p>
              </div>
              {interestType === 'compound' && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary-100 text-primary-800">
                  Selected
                </span>
              )}
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-secondary-500">Interest Amount:</span>
                <span className="text-sm font-medium text-secondary-900">
                  {formatCurrency(compoundInterest.interestAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary-500">Total with Interest:</span>
                <span className="text-sm font-medium text-secondary-900">
                  {formatCurrency(compoundInterest.totalWithInterest)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary-500">Effective Rate:</span>
                <span className="text-sm font-medium text-secondary-900">
                  {((compoundInterest.interestAmount / principal) * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formula Explanation */}
      <div className="bg-white p-4 rounded-lg border border-secondary-200 text-sm">
        <h4 className="font-medium text-secondary-900 mb-2">How Interest is Calculated</h4>
        <ul className="space-y-2 text-secondary-700">
          <li>
            <span className="font-medium">Simple Interest:</span> Principal × Rate × Time
            <br />
            <span className="text-secondary-500">
              {formatCurrency(principal)} × {(interestRate / 100).toFixed(4)} × {(daysSinceTransaction / 365).toFixed(4)} = {formatCurrency(simpleInterest.interestAmount)}
            </span>
          </li>
          <li>
            <span className="font-medium">Compound Interest:</span> Principal × (1 + Rate/Frequency)^(Frequency × Time)
            <br />
            <span className="text-secondary-500">
              {formatCurrency(principal)} × (1 + {(interestRate / 100).toFixed(4)}/{compoundFrequency})^({compoundFrequency} × {(daysSinceTransaction / 365).toFixed(4)}) = {formatCurrency(compoundInterest.interestAmount)}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default InterestCalculator;