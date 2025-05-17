// src/components/people/PeopleList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPeople, deletePerson } from '../../api/peopleApi';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';
import ConfirmDialog from '../ui/ConfirmDialog';

const PeopleList = () => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ASC' });
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalCreditors: 0,
    totalDebtors: 0
  });

  // Load people
  useEffect(() => {
    const fetchPeople = async () => {
      try {
        setLoading(true);
        const { people: peopleData, stats: statsData } = await getPeople(searchTerm, sortConfig.key, sortConfig.direction);
        setPeople(peopleData || []);

        if (statsData) {
          setStats(statsData);
        } else {
          // Calculate basic stats if not provided by API
          const totalContacts = peopleData?.length || 0;
          const totalCreditors = peopleData?.filter(p => parseFloat(p.balance) > 0).length || 0;
          const totalDebtors = peopleData?.filter(p => parseFloat(p.balance) < 0).length || 0;

          setStats({
            totalContacts,
            totalCreditors,
            totalDebtors
          });
        }
      } catch (err) {
        console.error('Error fetching people:', err);
        setError('Failed to load people. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPeople();
  }, [searchTerm, sortConfig]);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle sort
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'ASC' ? 'DESC' : 'ASC',
    }));
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedPerson) return;

    try {
      setDeleteLoading(true);
      setDeleteError('');
      await deletePerson(selectedPerson.id);

      // Remove from state
      setPeople(prev =>
        prev.filter(person => person.id !== selectedPerson.id)
      );

      // Update stats
      setStats(prev => ({
        ...prev,
        totalContacts: prev.totalContacts - 1,
        totalCreditors: parseFloat(selectedPerson.balance) > 0
          ? prev.totalCreditors - 1
          : prev.totalCreditors,
        totalDebtors: parseFloat(selectedPerson.balance) < 0
          ? prev.totalDebtors - 1
          : prev.totalDebtors
      }));

      setShowDeleteDialog(false);
      setSelectedPerson(null);
    } catch (err) {
      console.error('Error deleting person:', err);

      if (err.response?.data?.error?.includes('transactions')) {
        setDeleteError('Cannot delete a person with associated transactions. Please delete their transactions first.');
      } else {
        setDeleteError('Failed to delete person. Please try again.');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading && people.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">People</h1>
          <p className="text-secondary-500 mt-1">Manage your contacts and their balances</p>
        </div>
        <Link
          to="/people/new"
          className="mt-4 md:mt-0 btn btn-primary"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
          </svg>
          Add Person
        </Link>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-secondary-500 mb-1">Total Contacts</div>
              <div className="text-xl font-bold text-secondary-900">{stats.totalContacts}</div>
            </div>
            <div className="p-2 rounded-lg bg-primary-100 text-primary-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-secondary-500 mb-1">Creditors</div>
              <div className="text-xl font-bold text-success-600">{stats.totalCreditors}</div>
            </div>
            <div className="p-2 rounded-lg bg-success-100 text-success-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div className="text-sm text-secondary-500 mt-2">People who owe you</div>
        </div>
        <div className="card p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-secondary-500 mb-1">Debtors</div>
              <div className="text-xl font-bold text-danger-600">{stats.totalDebtors}</div>
            </div>
            <div className="p-2 rounded-lg bg-danger-100 text-danger-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div className="text-sm text-secondary-500 mt-2">People you owe</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card mb-6">
        <div className="p-4">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-secondary-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={handleSearch}
              className="block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {/* People List */}
      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th
                className="table-header-cell cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Name</span>
                  {sortConfig.key === 'name' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      {sortConfig.direction === 'ASC' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      )}
                    </svg>
                  )}
                </div>
              </th>
              <th className="table-header-cell">
                Contact
              </th>
              <th
                className="table-header-cell text-right cursor-pointer"
                onClick={() => handleSort('balance')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Balance</span>
                  {sortConfig.key === 'balance' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      {sortConfig.direction === 'ASC' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      )}
                    </svg>
                  )}
                </div>
              </th>
              <th className="table-header-cell text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="table-body">
            {people.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center">
                  <div className="flex flex-col items-center justify-center py-6">
                    <svg className="w-12 h-12 text-secondary-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    <p className="text-secondary-500 text-lg mb-2 font-medium">No people found</p>
                    <p className="text-secondary-400 mb-4">Try adjusting your search or add a new person</p>
                    <Link to="/people/new" className="btn btn-primary">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                      </svg>
                      Add Person
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              people.map((person) => (
                <tr key={person.id} className="table-row">
                  <td className="table-cell font-medium">
                    <Link
                      to={`/people/${person.id}`}
                      className="text-primary-600 hover:text-primary-800 hover:underline"
                    >
                      {person.name}
                    </Link>
                  </td>
                  <td className="table-cell">
                    <div className="flex flex-col">
                      {person.email && (
                        <a href={`mailto:${person.email}`} className="text-secondary-600 hover:text-primary-600 hover:underline flex items-center mb-1">
                          <svg className="w-4 h-4 mr-1 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                          </svg>
                          {person.email}
                        </a>
                      )}
                      {person.phone && (
                        <a href={`tel:${person.phone}`} className="text-secondary-600 hover:text-primary-600 hover:underline flex items-center">
                          <svg className="w-4 h-4 mr-1 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                          </svg>
                          {person.phone}
                        </a>
                      )}
                      {!person.email && !person.phone && (
                        <span className="text-secondary-400 italic">No contact info</span>
                      )}
                    </div>
                  </td>
                  <td className={`table-cell text-right font-medium ${
                    parseFloat(person.balance) > 0
                      ? 'text-success-600'
                      : parseFloat(person.balance) < 0
                        ? 'text-danger-600'
                        : 'text-secondary-500'
                  }`}>
                    {formatCurrency(parseFloat(person.balance))}
                    {parseFloat(person.balance) > 0 && (
                      <div className="text-xs text-secondary-500 mt-1">They owe you</div>
                    )}
                    {parseFloat(person.balance) < 0 && (
                      <div className="text-xs text-secondary-500 mt-1">You owe them</div>
                    )}
                  </td>
                  <td className="table-cell text-right space-x-2 whitespace-nowrap">
                    <Link
                      to={`/people/edit/${person.id}`}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-primary-700 bg-primary-50 hover:bg-primary-100"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                      Edit
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedPerson(person);
                        setShowDeleteDialog(true);
                        setDeleteError('');
                      }}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-danger-700 bg-danger-50 hover:bg-danger-100"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Person"
        message={
          deleteError ?
            deleteError :
            selectedPerson ?
              <>
                <p>Are you sure you want to delete {selectedPerson.name}?</p>
                {parseFloat(selectedPerson.balance) !== 0 && (
                  <div className="mt-2 p-3 bg-secondary-50 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-warning-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                      </svg>
                      <span className="text-warning-800 font-medium">Warning</span>
                    </div>
                    <p className="mt-1 text-secondary-600">
                      This person has a balance of <span className={parseFloat(selectedPerson.balance) > 0 ? 'text-success-600 font-medium' : 'text-danger-600 font-medium'}>
                        {formatCurrency(parseFloat(selectedPerson.balance))}
                      </span>
                    </p>
                  </div>
                )}
                <p className="mt-3 text-danger-600">This action cannot be undone.</p>
              </> :
              "Are you sure you want to delete this person? This action cannot be undone."
        }
        confirmText={deleteError ? "OK" : "Delete"}
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteDialog(false);
          setSelectedPerson(null);
          setDeleteError('');
        }}
        isLoading={deleteLoading}
        hasError={!!deleteError}
      />
    </div>
  );
};

export default PeopleList;