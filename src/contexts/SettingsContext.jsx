import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    companyLabel: 'Company',
    maxAdminsPerCompany: 0,
    planFeatures: {
      free: {
        maxUsers: 3,
        emailSupport: false,
        customBranding: false,
        analytics: 'basic'
      },
      pro: {
        maxUsers: 100,
        emailSupport: true,
        customBranding: true,
        analytics: 'advanced'
      }
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const response = await settingsAPI.updateSettings(newSettings);
      setSettings(response.data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  };

  const value = {
    settings,
    updateSettings,
    fetchSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};