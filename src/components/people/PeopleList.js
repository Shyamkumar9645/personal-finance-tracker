// src/components/people/PeopleList.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPeople, deletePerson } from '../../api/peopleApi';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';
import ConfirmDialog from '../ui/ConfirmDialog';
import EmptyState from '../ui/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};
const PAGE_SIZE = 20;

const highlightMatch = (text, query) => {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'ig');
  return text.split(regex).map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-yellow-200">{part}</mark> : part
  );
};

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
    <motion.div
      className="container mx-auto px-4 py-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="flex flex-col md:flex-row justify-between items-center mb-8"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 mb-2 gradient-text">
            People
          </h1>
          <p className="text-secondary-500">
            Manage your contacts and their balances
          </p>
        </div>
        <Link
          to="/people/new"
          className="btn btn-primary flex items-center mt-4 md:mt-0"
          aria-label="Add Person"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
          </svg>
          Add Person
        </Link>
      </motion.div>

      {showSuccess && (
        <div className="mb-4 bg-green-100 text-green-800 px-4 py-2 rounded" role="status">
          Person deleted successfully.
        </div>
      )}

      {error && (
        <motion.div variants={itemVariants}>
          <ErrorAlert message={error} />
        </motion.div>
      )}

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
        variants={itemVariants}
      >
        <motion.div
          className="stat-card group"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="stat-card-icon bg-primary-100 text-primary-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
          </div>
          <div className="text-sm text-secondary-500 mb-1">Contacts</div>
          <div className="text-2xl font-bold text-secondary-900">{stats.totalContacts}</div>
        </motion.div>
        <motion.div
          className="stat-card bg-gradient-to-br from-success-50 to-white border-success-200 group"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="stat-card-icon bg-success-100 text-success-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          </div>
          <div className="text-sm text-secondary-500 mb-1">Creditors</div>
          <div className="text-2xl font-bold text-success-600">{stats.totalCreditors}</div>
        </motion.div>
        <motion.div
          className="stat-card bg-gradient-to-br from-danger-50 to-white border-danger-200 group"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="stat-card-icon bg-danger-100 text-danger-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
            </svg>
          </div>
          <div className="text-sm text-secondary-500 mb-1">Debtors</div>
          <div className="text-2xl font-bold text-danger-600">{stats.totalDebtors}</div>
        </motion.div>
      </motion.div>

      {/* Search */}
      <motion.div
        className="card-gradient mb-6 sticky top-3 z-10"
        variants={itemVariants}
      >
        <div className="p-4">
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
      </motion.div>

      {/* People Table */}
      <motion.div className="overflow-x-auto rounded-xl shadow bg-white" variants={itemVariants}>
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th
                className="px-4 py-3 text-left font-semibold text-primary-800 whitespace-nowrap cursor-pointer"
                onClick={() => handleSort('name')}
                scope="col"
                aria-sort={sortConfig.key === 'name' ? (sortConfig.direction === 'ASC' ? 'ascending' : 'descending') : 'none'}
              >
                <div className="flex items-center space-x-1">
                  <span>Name</span>
                  {sortConfig.key === 'name' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {sortConfig.direction === 'ASC' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      )}
                    </svg>
                  )}
                </div>
              </th>
              <th
                className="px-4 py-3 text-right font-semibold text-primary-800 whitespace-nowrap cursor-pointer"
                onClick={() => handleSort('balance')}
                scope="col"
                aria-sort={sortConfig.key === 'balance' ? (sortConfig.direction === 'ASC' ? 'ascending' : 'descending') : 'none'}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Balance</span>
                  {sortConfig.key === 'balance' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {sortConfig.direction === 'ASC' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      )}
                    </svg>
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-right font-semibold text-primary-800 whitespace-nowrap" scope="col">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {people.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-4 py-8 text-center">
                  <EmptyState
                    title="No people found"
                    description="Try searching or add a new person to get started."
                    actionLabel="Add Person"
                    actionLink="/people/new"
                  />
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {people.map((person, idx) => (
                  <motion.tr
                    key={person.id}
                    className="group hover:bg-primary-50 transition cursor-pointer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={e => {
                      if (
                        e.target.closest('button') ||
                        e.target.closest('a')
                      ) return;
                      navigate(`/people/edit/${person.id}`);
                    }}
                  >
                    <td className="px-4 py-3 font-medium whitespace-nowrap">
                      <span className="flex items-center space-x-3">
                        <span className="avatar-md bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 font-semibold">
                          {person.name[0].toUpperCase()}
                        </span>
                        <span>
                          {highlightMatch(person.name, searchTerm)}
                        </span>
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right font-medium whitespace-nowrap ${
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
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              navigate(`/people/edit/${person.id}`);
                            }}
                            className="icon-button-primary"
                            aria-label={`Edit ${person.name}`}
                          >
                            <svg className="w-5 h-5 text-primary-600 hover:text-primary-800 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                          </button>
                        </motion.div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedPerson(person);
                            setShowDeleteDialog(true);
                            setDeleteError('');
                          }}
                          className="icon-button"
                          aria-label={`Delete ${person.name}`}
                        >
                          <svg className="w-5 h-5 text-danger-600 hover:text-danger-800 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </motion.div>

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
                      <svg className="w-5 h-5 text-warning-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    </motion.div>
  );
};

export default PeopleList;
