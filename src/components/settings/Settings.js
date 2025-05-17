// src/components/settings/Settings.js
import React from 'react';
import ChangePassword from './ChangePassword';

const Settings = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <ChangePassword />
      </div>
    </div>
  );
};

export default Settings;