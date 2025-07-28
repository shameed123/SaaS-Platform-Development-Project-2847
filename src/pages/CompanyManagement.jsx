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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [editingCompany, setEditingCompany] = useState({});
  const [newCompany, setNewCompany] = useState({
    name: '',
    slug: '',
    domain: '',
    industry: '',
    size: '',
    subscription_plan: 'free',
    subscription_status: 'inactive',
    max_users: 3
  });

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
      toast.success(`${settings.companyLabel || 'Company'} created successfully!`);
      setShowCreateModal(false);
      setNewCompany({
        name: '',
        slug: '',
        domain: '',
        industry: '',
        size: '',
        subscription_plan: 'free',
        subscription_status: 'inactive',
        max_users: 3
      });
      fetchCompanies();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to create ${settings.companyLabel?.toLowerCase() || 'company'}`);
    }
  };

  const handleDeleteCompany = async (companyId) => {
          if (window.confirm(`Are you sure you want to delete this ${settings.companyLabel?.toLowerCase() || 'company'}?`)) {
      try {
        await companyAPI.deleteCompany(companyId);
                  toast.success(`${settings.companyLabel || 'Company'} deleted successfully`);
        fetchCompanies();
      } catch (error) {
        toast.error(`Failed to delete ${settings.companyLabel?.toLowerCase() || 'company'}`);
      }
    }
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleViewDetails = (company) => {
    setSelectedCompany(company);
    setShowDetailsModal(true);
  };

  const handleEditCompany = (company) => {
    setEditingCompany({
      id: company.id,
      name: company.name,
      domain: company.domain || '',
      industry: company.industry || '',
      size: company.size || '',
      subscription_plan: company.subscription_plan || 'free',
      subscription_status: company.subscription_status || 'inactive',
      max_users: company.max_users || 3
    });
    setShowEditModal(true);
    setShowDetailsModal(false);
  };

  const handleUpdateCompany = async () => {
    try {
      await companyAPI.updateCompany(editingCompany.id, editingCompany);
      toast.success(`${settings.companyLabel || 'Company'} updated successfully!`);
      setShowEditModal(false);
      setEditingCompany({});
      fetchCompanies();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to update ${settings.companyLabel?.toLowerCase() || 'company'}`);
    }
  };

  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
                      <h1 className="text-2xl font-bold text-gray-900">{settings.companyLabel || 'Company'} Management</h1>
          <p className="text-gray-600">
            Manage all {settings.companyLabel?.toLowerCase() || 'company'}s on the platform
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
                        <span>Create {settings.companyLabel || 'Company'}</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="relative">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
                            placeholder={`Search ${settings.companyLabel?.toLowerCase() || 'company'}s...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <SafeIcon icon={FiBuilding} className="w-6 h-6 text-white" />
              </div>
              <div className="flex space-x-1">
                 <button 
                   onClick={() => handleEditCompany(company)}
                   className="p-1 text-gray-400 hover:text-teal-600 transition-colors"
                 >
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
                <button 
                  onClick={() => handleViewDetails(company)}
                  className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                >
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
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No {settings.companyLabel?.toLowerCase() || 'company'}s found</h3>
          <p className="text-gray-500">
            {searchTerm 
              ? 'Try adjusting your search criteria.'
              : `Get started by creating your first ${settings.companyLabel?.toLowerCase() || 'company'}.`
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
            className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Create {settings.companyLabel || 'Company'}</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <SafeIcon icon={FiIcons.FiX} className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {settings.companyLabel || 'Company'} Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCompany.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setNewCompany({
                         ...newCompany,
                      name,
                      slug: generateSlug(name)
                    });
                  }}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Acme Corporation"
                     required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCompany.slug}
                  onChange={(e) => setNewCompany({ ...newCompany, slug: e.target.value })}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="acme-corporation"
                     required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be used in URLs and must be unique
                </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domain
                  </label>
                                     <input
                     type="text"
                     value={newCompany.domain}
                     onChange={(e) => setNewCompany({ ...newCompany, domain: e.target.value })}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                     placeholder="acme.com"
                   />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                                     <select
                     value={newCompany.industry}
                     onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                   >
                    <option value="">Select Industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Education">Education</option>
                    <option value="Retail">Retail</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Size
                  </label>
                                     <select
                     value={newCompany.size}
                     onChange={(e) => setNewCompany({ ...newCompany, size: e.target.value })}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                   >
                    <option value="">Select Size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-100">51-100 employees</option>
                    <option value="101-500">101-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subscription Plan
                  </label>
                                     <select
                     value={newCompany.subscription_plan}
                     onChange={(e) => setNewCompany({ ...newCompany, subscription_plan: e.target.value })}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                   >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subscription Status
                  </label>
                                     <select
                     value={newCompany.subscription_status}
                     onChange={(e) => setNewCompany({ ...newCompany, subscription_status: e.target.value })}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                   >
                    <option value="inactive">Inactive</option>
                    <option value="active">Active</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="past_due">Past Due</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Users Allowed
                  </label>
                                     <input
                     type="number"
                     value={newCompany.max_users}
                     onChange={(e) => setNewCompany({ ...newCompany, max_users: parseInt(e.target.value) || 3 })}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                     min="1"
                     placeholder="3"
                   />
                  <p className="text-xs text-gray-500 mt-1">
                    Set to -1 for unlimited users
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCompany}
                disabled={!newCompany.name || !newCompany.slug}
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create {settings.companyLabel || 'Company'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Company Details Modal */}
      {showDetailsModal && selectedCompany && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedCompany.name} Details
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <SafeIcon icon={FiIcons.FiX} className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <p className="text-sm text-gray-900">{selectedCompany.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Domain
                  </label>
                  <p className="text-sm text-gray-900">{selectedCompany.domain || 'Not set'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry
                  </label>
                  <p className="text-sm text-gray-900">{selectedCompany.industry || 'Not specified'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Size
                  </label>
                  <p className="text-sm text-gray-900">{selectedCompany.size || 'Not specified'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Users
                  </label>
                  <p className="text-sm text-gray-900">{selectedCompany.userCount || 0} users</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subscription Plan
                  </label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedCompany.subscription_plan === 'pro' 
                      ? 'bg-teal-100 text-teal-800' 
                      : selectedCompany.subscription_plan === 'enterprise'
                      ? 'bg-cyan-100 text-cyan-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedCompany.subscription_plan || 'Free'}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subscription Status
                  </label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedCompany.subscription_status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedCompany.subscription_status || 'Inactive'}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Created Date
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedCompany.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Users Allowed
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedCompany.max_users === -1 ? 'Unlimited' : selectedCompany.max_users || 3}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
                             <button
                 onClick={() => handleEditCompany(selectedCompany)}
                 className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
               >
                 Edit {settings.companyLabel || 'Company'}
               </button>
            </div>
                     </motion.div>
         </div>
       )}

       {/* Edit Company Modal */}
       {showEditModal && (
         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
           <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
           >
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-xl font-semibold text-gray-900">
                 Edit {settings.companyLabel || 'Company'}
               </h3>
               <button
                 onClick={() => setShowEditModal(false)}
                 className="text-gray-400 hover:text-gray-600"
               >
                 <SafeIcon icon={FiIcons.FiX} className="w-6 h-6" />
               </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     {settings.companyLabel || 'Company'} Name *
                   </label>
                   <input
                     type="text"
                     value={editingCompany.name || ''}
                     onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                     placeholder="Acme Corporation"
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Domain
                   </label>
                   <input
                     type="text"
                     value={editingCompany.domain || ''}
                     onChange={(e) => setEditingCompany({ ...editingCompany, domain: e.target.value })}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                     placeholder="acme.com"
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Industry
                   </label>
                   <select
                     value={editingCompany.industry || ''}
                     onChange={(e) => setEditingCompany({ ...editingCompany, industry: e.target.value })}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                   >
                     <option value="">Select Industry</option>
                     <option value="Technology">Technology</option>
                     <option value="Healthcare">Healthcare</option>
                     <option value="Finance">Finance</option>
                     <option value="Education">Education</option>
                     <option value="Retail">Retail</option>
                     <option value="Manufacturing">Manufacturing</option>
                     <option value="Consulting">Consulting</option>
                     <option value="Other">Other</option>
                   </select>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Company Size
                   </label>
                   <select
                     value={editingCompany.size || ''}
                     onChange={(e) => setEditingCompany({ ...editingCompany, size: e.target.value })}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                   >
                     <option value="">Select Size</option>
                     <option value="1-10">1-10 employees</option>
                     <option value="11-50">11-50 employees</option>
                     <option value="51-100">51-100 employees</option>
                     <option value="101-500">101-500 employees</option>
                     <option value="501-1000">501-1000 employees</option>
                     <option value="1000+">1000+ employees</option>
                   </select>
                 </div>
               </div>

               <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Subscription Plan
                   </label>
                   <select
                     value={editingCompany.subscription_plan || 'free'}
                     onChange={(e) => setEditingCompany({ ...editingCompany, subscription_plan: e.target.value })}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                   >
                     <option value="free">Free</option>
                     <option value="pro">Pro</option>
                     <option value="enterprise">Enterprise</option>
                   </select>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Subscription Status
                   </label>
                   <select
                     value={editingCompany.subscription_status || 'inactive'}
                     onChange={(e) => setEditingCompany({ ...editingCompany, subscription_status: e.target.value })}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                   >
                     <option value="inactive">Inactive</option>
                     <option value="active">Active</option>
                     <option value="cancelled">Cancelled</option>
                     <option value="past_due">Past Due</option>
                   </select>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Max Users Allowed
                   </label>
                   <input
                     type="number"
                     value={editingCompany.max_users || 3}
                     onChange={(e) => setEditingCompany({ ...editingCompany, max_users: parseInt(e.target.value) || 3 })}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                     min="1"
                     placeholder="3"
                   />
                   <p className="text-xs text-gray-500 mt-1">
                     Set to -1 for unlimited users
                   </p>
                 </div>
               </div>
             </div>

             <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
               <button
                 onClick={() => setShowEditModal(false)}
                 className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
               >
                 Cancel
               </button>
               <button
                 onClick={handleUpdateCompany}
                 disabled={!editingCompany.name}
                 className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 Update {settings.companyLabel || 'Company'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default CompanyManagement;