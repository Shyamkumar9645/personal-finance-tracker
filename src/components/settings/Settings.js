import React from 'react';
import ChangePassword from './ChangePassword';

const Settings = () => {
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Settings</h1>

      <div className="glass rounded-lg shadow-xl p-6 border border-gray-100/50 dark:border-gray-700/50 animate-fade-in-up">
        <ChangePassword />
      </div>
    </div>
  );
};

export default Settings;