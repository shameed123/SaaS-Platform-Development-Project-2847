import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await authAPI.verifyToken();
        setUser(response.data.user);
      }
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      toast.success('Account created! Please check your email for verification.');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const forgotPassword = async (email) => {
    try {
      await authAPI.forgotPassword({ email });
      toast.success('Password reset email sent!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await authAPI.resetPassword({ token, password });
      toast.success('Password reset successful!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password reset failed');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const verifyEmail = async (token) => {
    try {
      await authAPI.verifyEmail({ token });
      toast.success('Email verified successfully!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Email verification failed');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};