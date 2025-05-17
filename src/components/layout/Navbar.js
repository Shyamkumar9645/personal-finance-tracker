// src/components/layout/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../api/authApi';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { currentUser, clearUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsProfileOpen(false);
      setIsMenuOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Prevent clicks inside the menus from closing them
  const handleMenuClick = (e) => {
    e.stopPropagation();
  };

  // Handle route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    clearUser();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="inline-flex items-center justify-center p-2 rounded-md text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-1 flex items-center justify-center md:justify-start">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <svg className="h-8 w-8 text-primary-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9H21M7 15H9M13 15H15M6 19H18C19.6569 19 21 17.6569 21 16V8C21 6.34315 19.6569 5 18 5H6C4.34315 5 3 6.34315 3 8V16C3 17.6569 4.34315 19 6 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="ml-2 text-primary-600 font-bold text-xl">Finance Tracker</span>
            </Link>

            {/* Desktop menu */}
            <div className="hidden md:block md:ml-6">
              <div className="flex space-x-1">
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-secondary-700 hover:bg-secondary-100 hover:text-primary-600'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/transactions"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/transactions')
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-secondary-700 hover:bg-secondary-100 hover:text-primary-600'
                  }`}
                >
                  Transactions
                </Link>
                <Link
                  to="/people"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/people')
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-secondary-700 hover:bg-secondary-100 hover:text-primary-600'
                  }`}
                >
                  People
                </Link>
              </div>
            </div>
          </div>

          {/* User profile dropdown */}
          {currentUser && (
            <div className="ml-3 relative">
              <div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProfileOpen(!isProfileOpen);
                  }}
                  className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                    {currentUser.firstName?.[0] || currentUser.email[0].toUpperCase()}
                  </div>
                </button>
              </div>

              {/* Profile dropdown panel */}
              {isProfileOpen && (
                <div
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-dropdown py-1 bg-white ring-1 ring-black ring-opacity-5 z-10"
                  onClick={handleMenuClick}
                >
                  <div className="px-4 py-3 border-b border-secondary-100">
                    <div className="font-semibold text-secondary-900">{currentUser.firstName} {currentUser.lastName}</div>
                    <div className="text-sm text-secondary-500 truncate">{currentUser.email}</div>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                  >
                    Your Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 font-medium"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden" onClick={handleMenuClick}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive('/dashboard')
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-secondary-700 hover:bg-secondary-100 hover:text-primary-600'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/transactions"
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive('/transactions')
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-secondary-700 hover:bg-secondary-100 hover:text-primary-600'
              }`}
            >
              Transactions
            </Link>
            <Link
              to="/people"
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive('/people')
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-secondary-700 hover:bg-secondary-100 hover:text-primary-600'
              }`}
            >
              People
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;