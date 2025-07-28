import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';
import { companyAPI } from '../services/api';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import toast from 'react-hot-toast';

const { FiPlus, FiEdit, FiTrash, FiUsers, FiSearch, FiBuilding, FiCalendar } = FiIcons;

function CompanyManagement() {
  const { settings } = useSettings();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', slug: '' });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await companyAPI.getCompanies();
      setCompanies(response.data);
    } catch (error) {
      toast.error('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async () => {
    try {
      await companyAPI.createCompany(newCompany);
      toast.success(`${settings.companyLabel} created successfully!`);
      setShowCreateModal(false);
      setNewCompany({ name: '', slug: '' });
      fetchCompanies();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to create ${settings.companyLabel.toLowerCase()}`);
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (window.confirm(`Are you sure you want to delete this ${settings.companyLabel.toLowerCase()}?`)) {
      try {
        await companyAPI.deleteCompany(companyId);
        toast.success(`${settings.companyLabel} deleted successfully`);
        fetchCompanies();
      } catch (error) {
        toast.error(`Failed to delete ${settings.companyLabel.toLowerCase()}`);
      }
    }
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{settings.companyLabel} Management</h1>
          <p className="text-gray-600">
            Manage all {settings.companyLabel.toLowerCase()}s on the platform
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>Create {settings.companyLabel}</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="relative">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={`Search ${settings.companyLabel.toLowerCase()}s...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company, index) => (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <SafeIcon icon={FiBuilding} className="w-6 h-6 text-white" />
              </div>
              <div className="flex space-x-1">
                <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                  <SafeIcon icon={FiEdit} className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCompany(company.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <SafeIcon icon={FiTrash} className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">{company.name}</h3>
            <p className="text-sm text-gray-500 mb-4">@{company.slug}</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiUsers} className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Users</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{company.userCount || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiCalendar} className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Created</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {new Date(company.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  company.subscription?.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {company.subscription?.plan || 'Free'}
                </span>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiBuilding} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No {settings.companyLabel.toLowerCase()}s found</h3>
          <p className="text-gray-500">
            {searchTerm 
              ? 'Try adjusting your search criteria.'
              : `Get started by creating your first ${settings.companyLabel.toLowerCase()}.`
            }
          </p>
        </div>
      )}

      {/* Create Company Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create {settings.companyLabel}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {settings.companyLabel} Name
                </label>
                <input
                  type="text"
                  value={newCompany.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setNewCompany({
                      name,
                      slug: generateSlug(name)
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Acme Corporation"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={newCompany.slug}
                  onChange={(e) => setNewCompany({ ...newCompany, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="acme-corporation"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be used in URLs and must be unique
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCompany}
                disabled={!newCompany.name || !newCompany.slug}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create {settings.companyLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default CompanyManagement;