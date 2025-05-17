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

  // Load people
  useEffect(() => {
    const fetchPeople = async () => {
      try {
        setLoading(true);
        const { people: peopleData } = await getPeople(searchTerm, sortConfig.key, sortConfig.direction);
        setPeople(peopleData || []);
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">People</h1>
        <Link
          to="/people/new"
          className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
        >
          Add Person
        </Link>
      </div>

      {error && <ErrorAlert message={error} />}

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-4">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  Name
                  {sortConfig.key === 'name' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ASC' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('balance')}
                >
                  Balance
                  {sortConfig.key === 'balance' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ASC' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {people.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                    No people found. Try adjusting your search or add a new person.
                  </td>
                </tr>
              ) : (
                people.map((person) => (
                  <tr key={person.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Link
                        to={`/people/${person.id}`}
                        className="text-blue-600 hover:text-blue-900 hover:underline text-sm font-medium"
                      >
                        {person.name}
                      </Link>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {person.email && (
                        <div className="mb-1">
                          <a href={`mailto:${person.email}`} className="hover:underline">
                            {person.email}
                          </a>
                        </div>
                      )}
                      {person.phone && (
                        <div>
                          <a href={`tel:${person.phone}`} className="hover:underline">
                            {person.phone}
                          </a>
                        </div>
                      )}
                      {!person.email && !person.phone && '-'}
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium text-right ${
                      parseFloat(person.balance) > 0
                        ? 'text-green-600'
                        : parseFloat(person.balance) < 0
                          ? 'text-red-600'
                          : 'text-gray-500'
                    }`}>
                      {formatCurrency(parseFloat(person.balance))}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/people/edit/${person.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedPerson(person);
                          setShowDeleteDialog(true);
                          setDeleteError('');
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Person"
        message={deleteError || "Are you sure you want to delete this person? This action cannot be undone."}
        confirmText="Delete"
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
