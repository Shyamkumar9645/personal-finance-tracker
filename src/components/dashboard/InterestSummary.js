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
        setError('Failed to load interest data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchInterestData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  if (!summary || summary.transactionCount === 0) {
    return (
      <div className="bg-white rounded-3xl shadow border border-gray-100 p-16 text-center animate-fade-in">
        <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-primary-700 mb-4">No Interest Data Available</h3>
        <p className="text-secondary-500 text-lg mb-8">You don't have any transactions with interest applied yet.</p>
        <Link to="/transactions/new" className="text-white bg-primary-600 hover:bg-primary-700 font-medium rounded-lg text-sm px-6 py-3 transition-colors inline-flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Add Transaction with Interest
        </Link>
      </div>
    );
  }

  const { totalPrincipal, totalSimpleInterest, totalWithSimpleInterest, totalCompoundInterest, totalWithCompoundInterest } = summary;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Tabs */}
      <div className="flex space-x-1 bg-white/80 backdrop-blur-sm rounded-2xl p-1 shadow-lg border border-secondary-200/50 max-w-md">
        <button
          className={`flex-1 py-3 px-6 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
            activeTab === 'overview'
              ? 'bg-primary-50 text-primary-700 shadow-md transform scale-105'
              : 'text-secondary-600 hover:bg-secondary-100 hover:text-primary-600'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="text-base">📊</span>
          <span>Overview</span>
        </button>
        <button
          className={`flex-1 py-3 px-6 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
            activeTab === 'byPerson'
              ? 'bg-primary-50 text-primary-700 shadow-md transform scale-105'
              : 'text-secondary-600 hover:bg-secondary-100 hover:text-primary-600'
          }`}
          onClick={() => setActiveTab('byPerson')}
        >
          <span className="text-base">👥</span>
          <span>By Person</span>
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="group bg-white rounded-3xl shadow-xl p-6 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 border border-gray-100">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-secondary-500 mb-1">Principal Balance</div>
                  <div className={`text-2xl font-bold ${totalPrincipal >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                    {formatCurrency(totalPrincipal)}
                  </div>
                </div>
              </div>
              <div className="text-xs text-secondary-500">Total amount without interest</div>
            </div>

            <div className="group bg-white rounded-3xl shadow-xl p-6 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 border border-gray-100">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-secondary-500 mb-1">Simple Interest</div>
                  <div className={`text-2xl font-bold ${totalSimpleInterest >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                    {formatCurrency(totalSimpleInterest)}
                  </div>
                </div>
              </div>
              <div className="text-xs text-secondary-500">
                Total: {formatCurrency(totalWithSimpleInterest)}
              </div>
            </div>

            <div className="group bg-white rounded-3xl shadow-xl p-6 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 border border-gray-100">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-secondary-500 mb-1">Compound Interest</div>
                  <div className={`text-2xl font-bold ${totalCompoundInterest >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                    {formatCurrency(totalCompoundInterest)}
                  </div>
                </div>
              </div>
              <div className="text-xs text-secondary-500">
                Total: {formatCurrency(totalWithCompoundInterest)}
              </div>
            </div>

            <div className="group bg-white rounded-3xl shadow-xl p-6 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 border border-gray-100">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-secondary-500 mb-1">Interest Difference</div>
                  <div className="text-2xl font-bold text-primary-700">
                    {formatCurrency(Math.abs(totalCompoundInterest - totalSimpleInterest))}
                  </div>
                </div>
              </div>
              <div className="text-xs text-secondary-500">
                {totalCompoundInterest > totalSimpleInterest
                  ? 'Compound is higher'
                  : 'Simple is higher'}
              </div>
            </div>
          </div>

          {/* Interest Growth Comparison */}
          <div className="bg-white rounded-3xl shadow border border-gray-100 p-8 mb-6">
            <h3 className="text-xl font-bold text-secondary-900 mb-4 flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span>Interest Growth Comparison</span>
            </h3>
            <p className="text-secondary-600 mb-6">
              Compound interest typically grows faster than simple interest over time, especially for longer-term loans. The difference can be significant over a period of years.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-primary-50 p-6 rounded-2xl border border-primary-100">
                <h4 className="text-lg font-bold text-primary-700 mb-4 flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>Simple Interest</span>
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-secondary-600 font-medium">Principal:</span>
                    <span className="font-bold text-secondary-900">{formatCurrency(totalPrincipal)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-secondary-600 font-medium">Interest Amount:</span>
                    <span className="font-bold text-secondary-900">{formatCurrency(totalSimpleInterest)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-primary-200 pt-3">
                    <span className="text-secondary-600 font-medium">Total:</span>
                    <span className="font-bold text-primary-700 text-lg">{formatCurrency(totalWithSimpleInterest)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-secondary-600 font-medium">Effective Rate:</span>
                    <span className="font-bold text-primary-600">
                      {totalPrincipal ? ((totalSimpleInterest / totalPrincipal) * 100).toFixed(2) : '0.00'}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-secondary-50 p-6 rounded-2xl border border-secondary-200">
                <h4 className="text-lg font-bold text-secondary-700 mb-4 flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  <span>Compound Interest</span>
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-secondary-600 font-medium">Principal:</span>
                    <span className="font-bold text-secondary-900">{formatCurrency(totalPrincipal)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-secondary-600 font-medium">Interest Amount:</span>
                    <span className="font-bold text-secondary-900">{formatCurrency(totalCompoundInterest)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-secondary-200 pt-3">
                    <span className="text-secondary-600 font-medium">Total:</span>
                    <span className="font-bold text-secondary-700 text-lg">{formatCurrency(totalWithCompoundInterest)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-secondary-600 font-medium">Effective Rate:</span>
                    <span className="font-bold text-secondary-600">
                      {totalPrincipal ? ((totalCompoundInterest / totalPrincipal) * 100).toFixed(2) : '0.00'}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // By Person tab
        <div>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-secondary-900 mb-2 flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span>Interest by Person</span>
            </h3>
            <p className="text-secondary-600">
              This shows the interest accrued or owed for each person you've transacted with.
            </p>
          </div>
          {!personSummary || personSummary.length === 0 ? (
            <div className="bg-white rounded-3xl shadow border border-gray-100 p-12 text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-secondary-600">No person-wise interest data available.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl shadow bg-white">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-primary-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-8 py-4 text-left font-bold text-primary-700 uppercase tracking-wider">Person</th>
                    <th className="px-8 py-4 text-right font-bold text-primary-700 uppercase tracking-wider">Principal</th>
                    <th className="px-8 py-4 text-right font-bold text-primary-700 uppercase tracking-wider">Simple Interest</th>
                    <th className="px-8 py-4 text-right font-bold text-primary-700 uppercase tracking-wider">Compound Interest</th>
                    <th className="px-8 py-4 text-right font-bold text-primary-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {personSummary.map((person, idx) => (
                    <tr key={person.personId} className={`hover:bg-primary-50 transition-all ${idx % 2 === 0 ? 'bg-white' : 'bg-primary-50'}`}>
                      <td className="px-8 py-6 font-medium whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 font-semibold">
                            {person.personName ? person.personName[0].toUpperCase() : '?'}
                          </div>
                          <Link to={`/people/${person.personId}`} className="text-primary-600 hover:text-primary-800 font-semibold hover:underline transition-colors">
                            {person.personName}
                          </Link>
                        </div>
                      </td>
                      <td className={`px-8 py-6 text-right font-medium whitespace-nowrap ${person.totalPrincipal >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                        {formatCurrency(person.totalPrincipal)}
                      </td>
                      <td className="px-8 py-6 text-right whitespace-nowrap">
                        <div className="font-bold text-secondary-900">
                          {formatCurrency(person.totalSimpleInterest)}
                        </div>
                        <div className="text-xs text-secondary-500 mt-1">
                          Total: {formatCurrency(person.totalWithSimpleInterest)}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right whitespace-nowrap">
                        <div className="font-bold text-secondary-900">
                          {formatCurrency(person.totalCompoundInterest)}
                        </div>
                        <div className="text-xs text-secondary-500 mt-1">
                          Total: {formatCurrency(person.totalWithCompoundInterest)}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right whitespace-nowrap">
                        <Link
                          to={`/people/${person.personId}`}
                          className="w-8 h-8 bg-primary-100 hover:bg-primary-200 text-primary-600 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
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