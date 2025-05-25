// src/components/people/PersonForm.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPerson, getPerson, updatePerson } from '../../api/peopleApi';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';

const initialFormState = {
  name: '',
  email: '',
  phone: '',
  notes: ''
};

const PersonForm = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const nameInputRef = useRef(null);

  // Load person data if editing
  useEffect(() => {
    if (!id) {
      nameInputRef.current?.focus();
      return;
    }
    const fetchPersonData = async () => {
      try {
        setInitialLoading(true);
        const { person } = await getPerson(id);
        setFormData({
          name: person.name || '',
          email: person.email || '',
          phone: person.phone || '',
          notes: person.notes || ''
        });
        setIsEdit(true);
      } catch (err) {
        setError('Failed to load person data. Please try again.');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchPersonData();
  }, [id]);

  // Field-level validation
  const validate = (data) => {
    const errors = {};
    if (!data.name.trim()) errors.name = 'Name is required.';
    if (data.email && !validateEmail(data.email)) errors.email = 'Please enter a valid email address.';
    if (data.phone && !validatePhone(data.phone)) errors.phone = 'Please enter a valid phone number.';
    return errors;
  };

  // Email validation
  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  // Phone validation (basic)
  const validatePhone = (phone) => {
    const re = /^\+?[\d\s\-().]{7,}$/;
    return re.test(phone);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    setError('');
  };

  // Handle blur for real-time validation
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const errors = validate({ ...formData, [name]: value });
    setFieldErrors(prev => ({ ...prev, [name]: errors[name] }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const errors = validate(formData);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      // Focus first invalid field
      const firstError = Object.keys(errors)[0];
      document.getElementById(`personform-${firstError}`)?.focus();
      return;
    }

    try {
      setLoading(true);
      if (isEdit) {
        await updatePerson(id, formData);
        setSuccess('Person updated successfully!');
      } else {
        await createPerson(formData);
        setSuccess('Person added successfully!');
        setFormData(initialFormState);
      }
      setTimeout(() => navigate('/people'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save person. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col md:flex-row bg-white shadow-xl rounded-2xl overflow-hidden max-w-3xl mx-auto animate-fade-in">
      {/* Sidebar/Avatar Section */}
      <div className="hidden md:flex flex-col items-center justify-center bg-primary-50 p-8 w-1/3">
        <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-primary-700 mb-2">
          {isEdit ? "Edit Person" : "Add New Person"}
        </h2>
        <p className="text-sm text-primary-500 text-center">
          Please fill in the details below to {isEdit ? "update" : "add"} a contact.
        </p>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="flex-1 p-8 space-y-6" noValidate aria-describedby="form-required">
        {error && <ErrorAlert message={error} className="mb-4" />}
        {success && (
          <div className="mb-4 bg-success-50 border-l-4 border-success-500 p-4 rounded-md" role="status" aria-live="polite">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-success-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-success-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Name Field */}
        <div>
          <label htmlFor="personform-name" className="block text-sm font-medium text-secondary-700">
            Name <span className="text-danger-500">*</span>
          </label>
          <div className="relative mt-1">
            <input
              type="text"
              id="personform-name"
              name="name"
              ref={nameInputRef}
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={`form-input w-full px-4 py-3 rounded-lg border-2 focus:border-primary-500 transition ${fieldErrors.name ? 'border-danger-500' : 'border-secondary-200'}`}
              placeholder="Enter full name"
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? "personform-name-error" : undefined}
              autoComplete="off"
            />
            {fieldErrors.name && (
              <span className="absolute right-3 top-3 text-danger-500" aria-live="polite">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </span>
            )}
          </div>
          {fieldErrors.name && (
            <div id="personform-name-error" className="mt-1 text-danger-500 text-xs" role="alert">
              {fieldErrors.name}
            </div>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="personform-email" className="block text-sm font-medium text-secondary-700">
            Email <span className="ml-1 text-xs text-secondary-400">(Optional)</span>
          </label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-3 text-secondary-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </span>
            <input
              type="email"
              id="personform-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input w-full pl-10 py-3 rounded-lg border-2 focus:border-primary-500 transition ${fieldErrors.email ? 'border-danger-500' : 'border-secondary-200'}`}
              placeholder="email@example.com"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "personform-email-error" : undefined}
              autoComplete="off"
            />
          </div>
          {fieldErrors.email && (
            <div id="personform-email-error" className="mt-1 text-danger-500 text-xs" role="alert">
              {fieldErrors.email}
            </div>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="personform-phone" className="block text-sm font-medium text-secondary-700">
            Phone <span className="ml-1 text-xs text-secondary-400">(Optional)</span>
          </label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-3 text-secondary-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
            </span>
            <input
              type="tel"
              id="personform-phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input w-full pl-10 py-3 rounded-lg border-2 focus:border-primary-500 transition ${fieldErrors.phone ? 'border-danger-500' : 'border-secondary-200'}`}
              placeholder="+1 (555) 123-4567"
              aria-invalid={!!fieldErrors.phone}
              aria-describedby={fieldErrors.phone ? "personform-phone-error" : undefined}
              autoComplete="off"
            />
          </div>
          {fieldErrors.phone && (
            <div id="personform-phone-error" className="mt-1 text-danger-500 text-xs" role="alert">
              {fieldErrors.phone}
            </div>
          )}
        </div>

        {/* Notes Field */}
        <div>
          <label htmlFor="personform-notes" className="block text-sm font-medium text-secondary-700">
            Notes <span className="ml-1 text-xs text-secondary-400">(Optional)</span>
          </label>
          <textarea
            id="personform-notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            className="form-input w-full px-4 py-3 rounded-lg border-2 focus:border-primary-500 transition border-secondary-200"
            placeholder="Add any additional information about this person"
            autoComplete="off"
          ></textarea>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/people')}
            className="btn btn-secondary px-6 py-2 rounded-lg"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary px-6 py-2 rounded-lg flex items-center"
            aria-busy={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                {isEdit ? 'Update Person' : 'Save Person'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonForm;
