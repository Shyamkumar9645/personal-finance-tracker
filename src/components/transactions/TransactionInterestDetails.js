// src/components/transactions/TransactionInterestDetails.js
import React, { useState, useEffect, useRef } from 'react';
import { getTransactionInterest, updateTransactionInterest } from '../../api/interestApi';
import InterestCalculator from '../interest/InterestCalculator';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';

const defaultSettings = {
  applyInterest: false,
  interestType: 'none',
  interestRate: '',
  compoundFrequency: ''
};

const TransactionInterestDetails = ({ transaction }) => {
  const [interestDetails, setInterestDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [interestSettings, setInterestSettings] = useState(defaultSettings);
  const [formErrors, setFormErrors] = useState({});
  const firstErrorRef = useRef(null);

  // Utility: Validate form fields
  const validate = (settings) => {
    const errors = {};
    if (settings.applyInterest) {
      if (settings.interestType === 'none') {
        errors.interestType = 'Please select an interest type.';
      }
      if (!settings.interestRate || Number(settings.interestRate) <= 0) {
        errors.interestRate = 'Enter a valid positive interest rate.';
      }
      if (settings.interestType === 'compound' && !settings.compoundFrequency) {
        errors.compoundFrequency = 'Select a compounding frequency.';
      }
    }
    return errors;
  };

  // Fetch interest details and initialize settings
  useEffect(() => {
    if (transaction) {
      fetchInterestDetails();
      setInterestSettings({
        applyInterest: transaction.applyInterest || false,
        interestType: transaction.interestType || 'none',
        interestRate: transaction.interestRate || '',
        compoundFrequency: transaction.compoundFrequency || ''
      });
      setFormErrors({});
      setSuccess('');
    }
  }, [transaction]);

  const fetchInterestDetails = async () => {
    if (!transaction?.id) return;
    try {
      setLoading(true);
      setError('');
      const data = await getTransactionInterest(transaction.id);
      setInterestDetails(data.interestDetails);
    } catch (err) {
      setError('Failed to load interest details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let updated = {
      ...interestSettings,
      [name]: type === 'checkbox' ? checked : value
    };
    // Reset interestType and frequency if disabling interest
    if (name === 'applyInterest' && !checked) {
      updated = { ...updated, interestType: 'none', compoundFrequency: '', interestRate: '' };
    }
    setInterestSettings(updated);
    setFormErrors({});
  };

  const handleSaveSettings = async () => {
    const errors = validate(interestSettings);
    setFormErrors(errors);
    setSuccess('');
    if (Object.keys(errors).length > 0) {
      // Focus first error field
      if (firstErrorRef.current) firstErrorRef.current.focus();
      return;
    }
    try {
      setLoading(true);
      setError('');
      const response = await updateTransactionInterest(transaction.id, interestSettings);
      setInterestDetails(response.interestDetails);
      setIsEditMode(false);
      setSuccess('Interest settings updated successfully.');
    } catch (err) {
      setError('Failed to update interest settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setFormErrors({});
    setSuccess('');
    setInterestSettings({
      applyInterest: transaction.applyInterest || false,
      interestType: transaction.interestType || 'none',
      interestRate: transaction.interestRate || '',
      compoundFrequency: transaction.compoundFrequency || ''
    });
  };

  if (loading && !interestDetails) {
    return <LoadingSpinner />;
  }

  return (
    <div className="animate-fade-in">
      {error && <ErrorAlert message={error} className="mb-4" />}
      {success && (
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-4" role="status">
          {success}
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-secondary-900" id="interest-section-title">
          Interest Calculations
        </h3>
        <div>
          {!isEditMode ? (
            <button
              onClick={() => setIsEditMode(true)}
              className="btn btn-secondary"
              aria-label="Edit Interest Settings"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              Edit Interest Settings
            </button>
          ) : (
            <div className="space-x-2">
              <button
                onClick={handleSaveSettings}
                className="btn btn-primary"
                disabled={loading}
                aria-disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Save
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                className="btn btn-secondary"
                disabled={loading}
                aria-disabled={loading}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditMode ? (
        <form
          className="bg-secondary-50 p-6 rounded-lg border border-secondary-200 mb-6"
          aria-labelledby="interest-section-title"
          onSubmit={e => { e.preventDefault(); handleSaveSettings(); }}
        >
          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="applyInterest"
                name="applyInterest"
                checked={interestSettings.applyInterest}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                aria-checked={interestSettings.applyInterest}
              />
              <label htmlFor="applyInterest" className="ml-2 text-sm font-medium text-secondary-700">
                Apply Interest to this Transaction
              </label>
            </div>
            <p className="mt-1 text-xs text-secondary-500 pl-6">
              Enable this to track interest accrual on this transaction
            </p>
          </div>

          {interestSettings.applyInterest && (
            <div className="space-y-4 mt-4 animate-fade-in">
              <div>
                <label htmlFor="interestType" className="form-label">
                  Interest Type <span className="text-danger-500">*</span>
                </label>
                <select
                  id="interestType"
                  name="interestType"
                  value={interestSettings.interestType}
                  onChange={handleInputChange}
                  className={`form-input ${formErrors.interestType ? 'border-danger-500' : ''}`}
                  required
                  aria-invalid={!!formErrors.interestType}
                  aria-describedby={formErrors.interestType ? 'interestType-error' : undefined}
                  ref={formErrors.interestType ? firstErrorRef : null}
                >
                  <option value="none">Select interest type</option>
                  <option value="simple">Simple Interest</option>
                  <option value="compound">Compound Interest</option>
                </select>
                {formErrors.interestType && (
                  <div id="interestType-error" className="text-danger-500 text-xs mt-1">{formErrors.interestType}</div>
                )}
                {interestSettings.interestType === 'simple' && (
                  <p className="mt-1 text-xs text-secondary-500">
                    Simple interest is calculated only on the principal amount.
                  </p>
                )}
                {interestSettings.interestType === 'compound' && (
                  <p className="mt-1 text-xs text-secondary-500">
                    Compound interest is calculated on the principal amount and the accumulated interest.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="interestRate" className="form-label">
                  Annual Interest Rate (%) <span className="text-danger-500">*</span>
                </label>
                <input
                  type="number"
                  id="interestRate"
                  name="interestRate"
                  value={interestSettings.interestRate}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  placeholder="e.g. 10.00"
                  className={`form-input ${formErrors.interestRate ? 'border-danger-500' : ''}`}
                  required
                  aria-invalid={!!formErrors.interestRate}
                  aria-describedby={formErrors.interestRate ? 'interestRate-error' : undefined}
                  ref={formErrors.interestRate && !formErrors.interestType ? firstErrorRef : null}
                  disabled={!interestSettings.applyInterest}
                />
                {formErrors.interestRate && (
                  <div id="interestRate-error" className="text-danger-500 text-xs mt-1">{formErrors.interestRate}</div>
                )}
                <p className="mt-1 text-xs text-secondary-500">
                  Enter the annual interest rate as a percentage (e.g., 10 for 10%)
                </p>
              </div>

              {interestSettings.interestType === 'compound' && (
                <div>
                  <label htmlFor="compoundFrequency" className="form-label">
                    Compound Frequency <span className="text-danger-500">*</span>
                  </label>
                  <select
                    id="compoundFrequency"
                    name="compoundFrequency"
                    value={interestSettings.compoundFrequency}
                    onChange={handleInputChange}
                    className={`form-input ${formErrors.compoundFrequency ? 'border-danger-500' : ''}`}
                    required
                    aria-invalid={!!formErrors.compoundFrequency}
                    aria-describedby={formErrors.compoundFrequency ? 'compoundFrequency-error' : undefined}
                    ref={formErrors.compoundFrequency && !formErrors.interestType && !formErrors.interestRate ? firstErrorRef : null}
                  >
                    <option value="">Select frequency</option>
                    <option value="1">Annually (1/year)</option>
                    <option value="2">Semi-Annually (2/year)</option>
                    <option value="4">Quarterly (4/year)</option>
                    <option value="12">Monthly (12/year)</option>
                    <option value="365">Daily (365/year)</option>
                  </select>
                  {formErrors.compoundFrequency && (
                    <div id="compoundFrequency-error" className="text-danger-500 text-xs mt-1">{formErrors.compoundFrequency}</div>
                  )}
                  <p className="mt-1 text-xs text-secondary-500">
                    How often the interest is compounded per year
                  </p>
                </div>
              )}
            </div>
          )}
        </form>
      ) : (
        <InterestCalculator
          transaction={transaction}
          interestDetails={interestDetails}
        />
      )}
    </div>
  );
};

export default TransactionInterestDetails;
