import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPeople, deletePerson } from '../../api/peopleApi';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';
import ConfirmDialog from '../ui/ConfirmDialog';
import EmptyState from '../ui/EmptyState';

const PAGE_SIZE = 20;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const searchTimeout = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError('');
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchPeople();
    }, 300);
    return () => clearTimeout(searchTimeout.current);
    // eslint-disable-next-line
  }, [searchTerm, sortConfig, currentPage]);

  const fetchPeople = async () => {
    try {
      const { people: peopleData, stats: statsData } = await getPeople(
        searchTerm, sortConfig.key, sortConfig.direction, currentPage, PAGE_SIZE
      );
      setPeople(peopleData || []);
      if (statsData) {
        setStats(statsData);
      } else {
        const totalContacts = peopleData?.length || 0;
        const totalCreditors = peopleData?.filter(p => parseFloat(p.balance) > 0).length || 0;
        const totalDebtors = peopleData?.filter(p => parseFloat(p.balance) < 0).length || 0;
        setStats({ totalContacts, totalCreditors, totalDebtors });
      }
    } catch (err) {
      setError('Failed to load people. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setCurrentPage(1);
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'ASC' ? 'DESC' : 'ASC',
    }));
  };

  const handleDelete = async () => {
    if (!selectedPerson) return;
    try {
      setDeleteLoading(true);
      setDeleteError('');
      await deletePerson(selectedPerson.id);
      setPeople(prev => prev.filter(person => person.id !== selectedPerson.id));
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
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
    } catch (err) {
      if (err.response?.data?.error?.includes('transactions')) {
        setDeleteError('Cannot delete a person with associated transactions. Please delete their transactions first.');
      } else {
        setDeleteError('Failed to delete person. Please try again.');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalPages = Math.ceil(stats.totalContacts / PAGE_SIZE);

  if (loading && people.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl animate-fade-in">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow border border-gray-100 overflow-hidden mb-8">
          <div className="px-8 py-6 border-b border-gray-100 bg-primary-50 flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <span className="text-xl text-primary-600">👤</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-700">All People</h1>
              <p className="text-primary-500 text-sm">View and manage all your contacts</p>
            </div>
            <div className="ml-auto flex gap-2">
              <Link
                to="/people/new"
                className="btn btn-primary flex items-center shadow hover:shadow-md transition-all duration-300 text-white bg-primary-600 hover:bg-primary-700 rounded-lg text-sm px-5 py-2.5"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
                Add Person
              </Link>
            </div>
          </div>
          <div className="p-8">
            {/* Stats */}

            {/* Search */}
            <div className="mb-6">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-secondary-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="block w-full pl-10 pr-10 py-2 border border-secondary-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  aria-label="Search people"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-2 flex items-center text-secondary-400 hover:text-secondary-600"
                    aria-label="Clear search"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
            {/* People Table */}
            {people.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl text-primary-600">👤</span>
                </div>
                <h3 className="text-2xl font-bold text-primary-700 mb-4">No people found</h3>
                <p className="text-secondary-500 text-lg mb-8">Start by adding your first contact</p>
                <Link
                  to="/people/new"
                  className="text-white bg-primary-600 hover:bg-primary-700 font-medium rounded-lg text-sm px-6 py-3 transition-colors inline-flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                  </svg>
                  Add a person
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl shadow bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-primary-50 sticky top-0 z-10">
                    <tr>
                      <th
                        className="px-8 py-4 text-left font-bold text-primary-700 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('name')}
                      >
                        Name
                      </th>
                      <th
                        className="px-8 py-4 text-right font-bold text-primary-700 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('balance')}
                      >
                        Balance
                      </th>
                      <th className="px-8 py-4 text-right font-bold text-primary-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {people.map((person, idx) => (
                      <tr
                        key={person.id}
                        className={`hover:bg-primary-50 transition-all ${idx % 2 === 0 ? 'bg-white' : 'bg-primary-50'} cursor-pointer`}
                        onClick={e => {
                          if (
                            e.target.closest('button') ||
                            e.target.closest('a')
                          ) return;
                          navigate(`/people/edit/${person.id}`);
                        }}
                      >
                        <td className="px-8 py-6 font-medium whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 font-semibold">
                              {person.name[0].toUpperCase()}
                            </div>
                            <span className="text-primary-900 font-medium">{person.name}</span>
                          </div>
                        </td>
                        <td className={`px-8 py-6 text-right font-medium whitespace-nowrap ${
                          parseFloat(person.balance) > 0
                            ? 'text-success-600'
                            : parseFloat(person.balance) < 0
                              ? 'text-danger-600'
                              : 'text-secondary-500'
                        }`}>
                          <span className="font-bold text-lg">
                            {formatCurrency(parseFloat(person.balance))}
                          </span>
                          {parseFloat(person.balance) > 0 && (
                            <div className="text-xs text-secondary-500 mt-1">They owe you</div>
                          )}
                          {parseFloat(person.balance) < 0 && (
                            <div className="text-xs text-secondary-500 mt-1">You owe them</div>
                          )}
                        </td>
                        <td className="px-8 py-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              to={`/people/edit/${person.id}`}
                              className="w-8 h-8 bg-primary-100 hover:bg-primary-200 text-primary-600 rounded-lg flex items-center justify-center transition-colors"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                            </Link>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setSelectedPerson(person);
                                setShowDeleteDialog(true);
                                setDeleteError('');
                              }}
                              className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-colors"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="flex justify-center mt-6" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 mx-1 rounded bg-secondary-100 hover:bg-secondary-200"
                  disabled={currentPage === 1}
                  aria-label="Previous Page"
                >
                  &larr;
                </button>
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`px-3 py-1 mx-1 rounded ${currentPage === idx + 1 ? 'bg-primary-200 font-bold' : 'bg-secondary-100 hover:bg-secondary-200'}`}
                    aria-current={currentPage === idx + 1 ? 'page' : undefined}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 mx-1 rounded bg-secondary-100 hover:bg-secondary-200"
                  disabled={currentPage === totalPages}
                  aria-label="Next Page"
                >
                  &rarr;
                </button>
              </nav>
            )}
          </div>
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
                  <p className="text-secondary-700 mb-2">Are you sure you want to delete {selectedPerson.name}?</p>
                  {parseFloat(selectedPerson.balance) !== 0 && (
                    <div className="bg-primary-50 rounded-2xl p-4 border border-primary-100 mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-secondary-600 font-medium">Current Balance:</span>
                        <span className={parseFloat(selectedPerson.balance) > 0 ? 'text-success-600 font-medium' : 'text-danger-600 font-medium'}>
                          {formatCurrency(parseFloat(selectedPerson.balance))}
                        </span>
                      </div>
                    </div>
                  )}
                  <p className="mt-3 text-red-600 text-sm font-semibold flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    This action cannot be undone.
                  </p>
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
    </div>
  );
};

export default PeopleList;