// src/components/layout/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

const Layout = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors-ease overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-auto p-4 glass m-4 rounded-xl shadow-lg animate-fade-in-up transition-all-ease">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;