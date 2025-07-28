import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import toast from 'react-hot-toast';

const { FiSettings, FiSave, FiUsers, FiDollarSign, FiShield } = FiIcons;

function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [formData, setFormData] = useState(settings);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await updateSettings(formData);
    if (result.success) {
      toast.success('Settings updated successfully!');
    } else {
      toast.error(result.error || 'Failed to update settings');
    }
    
    setLoading(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePlanFeatureChange = (plan, feature, value) => {
    setFormData(prev => ({
      ...prev,
      planFeatures: {
        ...prev.planFeatures,
        [plan]: {
          ...prev.planFeatures[plan],
          [feature]: value
        }
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-600">
          Configure global platform settings and features
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-warm-100 rounded-lg flex items-center justify-center">
          <SafeIcon icon={FiSettings} className="w-5 h-5 text-warm-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">General Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Label
              </label>
              <input
                type="text"
                value={formData.companyLabel}
                onChange={(e) => handleInputChange('companyLabel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg input-popup"
                placeholder="e.g., Company, Team, Organization"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be used throughout the platform interface
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Admins per {formData.companyLabel}
              </label>
                              <input
                  type="number"
                  value={formData.maxAdminsPerCompany}
                  onChange={(e) => handleInputChange('maxAdminsPerCompany', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg input-popup"
                  placeholder="0 for unlimited"
                  min="0"
                />
              <p className="text-xs text-gray-500 mt-1">
                Set to 0 for unlimited admins
              </p>
            </div>
          </div>
        </motion.div>

        {/* Plan Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-soft-100 rounded-lg flex items-center justify-center">
          <SafeIcon icon={FiDollarSign} className="w-5 h-5 text-soft-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Plan Features</h2>
          </div>

          <div className="space-y-6">
            {/* Free Plan */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Free Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Users
                  </label>
                  <input
                    type="number"
                    value={formData.planFeatures?.free?.maxUsers || 3}
                    onChange={(e) => handlePlanFeatureChange('free', 'maxUsers', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg input-popup"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Analytics Level
                  </label>
                  <select
                    value={formData.planFeatures?.free?.analytics || 'basic'}
                    onChange={(e) => handlePlanFeatureChange('free', 'analytics', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg input-popup"
                  >
                    <option value="basic">Basic</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.planFeatures?.free?.emailSupport || false}
                    onChange={(e) => handlePlanFeatureChange('free', 'emailSupport', e.target.checked)}
                    className="h-4 w-4 text-warm-600 focus:ring-warm-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Email Support
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.planFeatures?.free?.customBranding || false}
                    onChange={(e) => handlePlanFeatureChange('free', 'customBranding', e.target.checked)}
                    className="h-4 w-4 text-warm-600 focus:ring-warm-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Custom Branding
                  </label>
                </div>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pro Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Users
                  </label>
                  <input
                    type="number"
                    value={formData.planFeatures?.pro?.maxUsers || 100}
                    onChange={(e) => handlePlanFeatureChange('pro', 'maxUsers', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg input-popup"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Analytics Level
                  </label>
                  <select
                    value={formData.planFeatures?.pro?.analytics || 'advanced'}
                    onChange={(e) => handlePlanFeatureChange('pro', 'analytics', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg input-popup"
                  >
                    <option value="basic">Basic</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.planFeatures?.pro?.emailSupport || true}
                    onChange={(e) => handlePlanFeatureChange('pro', 'emailSupport', e.target.checked)}
                    className="h-4 w-4 text-warm-600 focus:ring-warm-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Email Support
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.planFeatures?.pro?.customBranding || true}
                    onChange={(e) => handlePlanFeatureChange('pro', 'customBranding', e.target.checked)}
                    className="h-4 w-4 text-warm-600 focus:ring-warm-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Custom Branding
                  </label>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiShield} className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Minimum Length
              </label>
              <input
                type="number"
                value={formData.passwordMinLength || 8}
                onChange={(e) => handleInputChange('passwordMinLength', parseInt(e.target.value) || 8)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg input-popup"
                min="6"
                max="32"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={formData.sessionTimeout || 60}
                onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value) || 60)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg input-popup"
                min="5"
                max="1440"
              />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.requireEmailVerification || true}
                onChange={(e) => handleInputChange('requireEmailVerification', e.target.checked)}
                className="h-4 w-4 text-warm-600 focus:ring-warm-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Require email verification for new accounts
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.enableTwoFactor || false}
                onChange={(e) => handleInputChange('enableTwoFactor', e.target.checked)}
                className="h-4 w-4 text-warm-600 focus:ring-warm-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Enable two-factor authentication option
              </label>
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
                            className="bg-gradient-to-r from-warm-500 to-soft-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <SafeIcon icon={FiSave} className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default SettingsPage;