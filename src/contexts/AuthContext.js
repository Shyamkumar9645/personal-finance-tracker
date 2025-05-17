// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getToken, getUserInfo, removeToken } from '../utils/auth';
import { getProfile } from '../api/authApi';

// Create auth context
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user data when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = getToken();
        if (!token) {
          setCurrentUser(null);
          setLoading(false);
          return;
        }

        // Get user info from decoded token
        const userInfo = getUserInfo();
        if (!userInfo || !userInfo.id) {
          removeToken();
          setCurrentUser(null);
          setLoading(false);
          return;
        }

        // Get complete user profile from API
        const { user } = await getProfile();
        setCurrentUser(user);
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user data. Please log in again.');
        removeToken();
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Update user state
  const updateUser = (user) => {
    setCurrentUser(user);
  };

  // Clear user state on logout
  const clearUser = () => {
    removeToken();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    updateUser,
    clearUser,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;