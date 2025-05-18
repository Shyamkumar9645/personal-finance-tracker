// src/components/dashboard/InterestSummary.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getInterestSummary, getPersonInterestSummary } from '../../api/interestApi';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';

const InterestSummary = () => {
  const [summary, setSummary] = useState(null);
  const [personSummary, setPersonSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchInterestData = async () => {
      try {
        setLoading(true);
        const [summaryData, personSummaryData] = await Promise.all([
          getInterestSummary(),
          getPersonInterestSummary()
        ]);

        setSummary(summaryData.summary);
        setPersonSummary(personSummaryData.personSummary);
      } catch (err) {
        console.error('Error fetching interest summary:', err);
        setError('Failed to load interest data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchInterestData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  // If no interest-bearing transactions
  if (!summary || summary.transactionCount === 0) {
    return (
      <div className="card p-6">
        <div className="text-center">
          <svg className="w-12 h-12 text-secondary-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No Interest Data Available</h3>
          <p className="text-secondary-500 mb-4">You don't have any transactions with interest applied yet.</p>
          <Link to="/transactions/new" className="btn btn-primary">
            Add Transaction with Interest
          </Link>
        </div>
      </div>
    );
  }

  // Full totals including all people
  const { totalPrincipal, totalSimpleInterest, totalWithSimpleInterest, totalCompoundInterest, totalWithCompoundInterest } = summary;

  return (
    <div className="space-y-6">
      <div className="flex border-b border-secondary-200">
        <button
          className={`py-3 px-5 font-medium ${
            activeTab === 'overview'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-secondary-500 hover:text-secondary-700'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`py-3 px-5 font-medium ${
            activeTab === 'byPerson'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-secondary-500 hover:text-secondary-700'
          }`}
          onClick={() => setActiveTab('byPerson')}
        >
          By Person
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="animate-fade-in">
          {/* Overview stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="card p-6">
              <h4 className="text-sm font-medium text-secondary-500 mb-1">Principal Balance</h4>
              <p className={`text-2xl font-bold ${totalPrincipal >= 0 ? 'text-success-700' : 'text-danger-700'}`}>
                {formatCurrency(totalPrincipal)}
              </p>
              <p className="text-xs text-secondary-500 mt-2">Total amount without interest</p>
            </div>

            <div className="card p-6">
              <h4 className="text-sm font-medium text-secondary-500 mb-1">Simple Interest</h4>
              <p className={`text-2xl font-bold ${totalSimpleInterest >= 0 ? 'text-success-700' : 'text-danger-700'}`}>
                {formatCurrency(totalSimpleInterest)}
              </p>
              <p className="text-xs text-secondary-500 mt-2">
                Total: {formatCurrency(totalWithSimpleInterest)}
              </p>
            </div>

            <div className="card p-6">
              <h4 className="text-sm font-medium text-secondary-500 mb-1">Compound Interest</h4>
              <p className={`text-2xl font-bold ${totalCompoundInterest >= 0 ? 'text-success-700' : 'text-danger-700'}`}>
                {formatCurrency(totalCompoundInterest)}
              </p>
              <p className="text-xs text-secondary-500 mt-2">
                Total: {formatCurrency(totalWithCompoundInterest)}
              </p>
            </div>

            <div className="card p-6">
              <h4 className="text-sm font-medium text-secondary-500 mb-1">Interest Difference</h4>
              <p className="text-2xl font-bold text-primary-700">
                {formatCurrency(Math.abs(totalCompoundInterest - totalSimpleInterest))}
              </p>
              <p className="text-xs text-secondary-500 mt-2">
                {totalCompoundInterest > totalSimpleInterest
                  ? 'Compound interest is higher'
                  : 'Simple interest is higher'}
              </p>
            </div>
          </div>

          {/* Interest Rate Comparison */}
          <div className="card p-6 mb-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Interest Growth Comparison</h3>
            <p className="text-secondary-600 mb-4">
              Compound interest typically grows faster than simple interest over time, especially for longer-term loans. The difference can be significant over a period of years.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-secondary-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-secondary-800 mb-2">Simple Interest</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex justify-between">
                    <span className="text-secondary-600">Principal:</span>
                    <span className="font-medium">{formatCurrency(totalPrincipal)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-secondary-600">Interest Amount:</span>
                    <span className="font-medium">{formatCurrency(totalSimpleInterest)}</span>
                  </li>
                  <li className="flex justify-between border-t border-secondary-200 pt-1 mt-1">
                    <span className="text-secondary-600">Total:</span>
                    <span className="font-medium">{formatCurrency(totalWithSimpleInterest)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-secondary-600">Effective Rate:</span>
                    <span className="font-medium">
                      {((totalSimpleInterest / totalPrincipal) * 100).toFixed(2)}%
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-secondary-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-secondary-800 mb-2">Compound Interest</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex justify-between">
                    <span className="text-secondary-600">Principal:</span>
                    <span className="font-medium">{formatCurrency(totalPrincipal)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-secondary-600">Interest Amount:</span>
                    <span className="font-medium">{formatCurrency(totalCompoundInterest)}</span>
                  </li>
                  <li className="flex justify-between border-t border-secondary-200 pt-1 mt-1">
                    <span className="text-secondary-600">Total:</span>
                    <span className="font-medium">{formatCurrency(totalWithCompoundInterest)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-secondary-600">Effective Rate:</span>
                    <span className="font-medium">
                      {((totalCompoundInterest / totalPrincipal) * 100).toFixed(2)}%
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in">
          {/* Person-wise interest summary */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">Interest by Person</h3>
            <p className="text-secondary-600">
              This shows the interest accrued or owed for each person you've transacted with.
            </p>
          </div>

          {!personSummary || personSummary.length === 0 ? (
            <div className="bg-secondary-50 p-6 rounded-lg text-center">
              <p className="text-secondary-600">No person-wise interest data available.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Person</th>
                    <th className="table-header-cell">Principal</th>
                    <th className="table-header-cell">Simple Interest</th>
                    <th className="table-header-cell">Compound Interest</th>
                    <th className="table-header-cell text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {personSummary.map((person) => (
                    <tr key={person.personId} className="table-row">
                      <td className="table-cell font-medium">
                        <Link to={`/people/${person.personId}`} className="text-primary-600 hover:text-primary-800 hover:underline">
                          {person.personName}
                        </Link>
                      </td>
                      <td className={`table-cell ${person.totalPrincipal >= 0 ? 'text-success-600' : 'text-danger-600'} font-medium`}>
                        {formatCurrency(person.totalPrincipal)}
                      </td>
                      <td className="table-cell">
                        {formatCurrency(person.totalSimpleInterest)}
                        <div className="text-xs text-secondary-500">
                          Total: {formatCurrency(person.totalWithSimpleInterest)}
                        </div>
                      </td>
                      <td className="table-cell">
                        {formatCurrency(person.totalCompoundInterest)}
                        <div className="text-xs text-secondary-500">
                          Total: {formatCurrency(person.totalWithCompoundInterest)}
                        </div>
                      </td>
                      <td className="table-cell text-right">
                        <Link
                          to={`/people/${person.personId}`}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-primary-700 bg-primary-50 hover:bg-primary-100"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InterestSummary;