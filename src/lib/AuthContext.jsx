import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiClient } from '@/services/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const getInitialUser = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const res = await apiClient.get('/api/auth/me');
          setUser(res.user);
        } catch (err) {
          console.error('Session validation failed:', err);
          localStorage.removeItem('auth_token');
        }
      }
      setIsLoadingAuth(false);
    };

    getInitialUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await apiClient.post('/api/auth/login', { email, password });
      localStorage.setItem('auth_token', res.token);
      setUser(res.user);
      return { data: res, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signUp = async (email, password, doctorData) => {
    try {
      const res = await apiClient.post('/api/auth/register', {
        email,
        password,
        doctorData
      });
      return { data: res, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const logout = async () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    return { error: null };
  };

  const resetPassword = async (email) => {
    // Return a mocked success response since SMTP is locally unavailable
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ error: null });
      }, 500);
    });
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      login,
      signUp,
      logout,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
