import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { userAPI } from '../services/api';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import toast from 'react-hot-toast';

const { FiPlus, FiEdit, FiTrash, FiMail, FiSearch, FiFilter, FiMoreVertical } = FiIcons;

function UserManagement() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  
  // New state for edit functionality
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    role: 'user'
  });
  
  // New state for email functionality
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailingUser, setEmailingUser] = useState(null);
  const [emailForm, setEmailForm] = useState({
    subject: '',
    message: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    try {
      await userAPI.inviteUser({
        email: inviteEmail,
        role: inviteRole
      });
      toast.success('User invitation sent successfully!');
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('user');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to invite user');
    }
  };

  const handleDeleteUser = async (userId) => {
    // Prevent deleting yourself
    if (userId === user?.id) {
      toast.error('You cannot delete your own account.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.deleteUser(userId);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  // New function to handle edit user
  const handleEditUser = (userToEdit) => {
    // Prevent editing yourself
    if (userToEdit.id === user?.id) {
      toast.error('You cannot edit your own profile from this page. Use the profile settings instead.');
      return;
    }
    
    setEditingUser(userToEdit);
    setEditForm({
      firstName: userToEdit.firstName || '',
      lastName: userToEdit.lastName || '',
      role: userToEdit.role || 'user'
    });
    setShowEditModal(true);
  };

  // New function to save edited user
  const handleSaveEdit = async () => {
    try {
      await userAPI.updateUser(editingUser.id, {
        first_name: editForm.firstName,
        last_name: editForm.lastName,
        role: editForm.role
      });
      toast.success('User updated successfully');
      setShowEditModal(false);
      setEditingUser(null);
      setEditForm({ firstName: '', lastName: '', role: 'user' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  // New function to handle email user
  const handleEmailUser = (user) => {
    setEmailingUser(user);
    setEmailForm({
      subject: `Message from ${settings.companyLabel || 'Your Company'}`,
      message: `Hello ${user.firstName || user.email},\n\n`
    });
    setShowEmailModal(true);
  };

  // New function to send email
  const handleSendEmail = async () => {
    try {
      await userAPI.sendEmail(emailingUser.id, {
        subject: emailForm.subject,
        message: emailForm.message
      });
      toast.success(`Email sent to ${emailingUser.email}`);
      setShowEmailModal(false);
      setEmailingUser(null);
      setEmailForm({ subject: '', message: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send email');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (user.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-warm-100 text-warm-800';
      case 'user':
        return 'bg-soft-100 text-soft-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warm-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">
            Manage users in your {settings.companyLabel?.toLowerCase() || 'company'}
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-gradient-to-r from-warm-500 to-soft-500 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>Invite User</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg input-popup"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiFilter} className="text-gray-400 w-5 h-5" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 input-popup"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
              {user?.role === 'super_admin' && <option value="super_admin">Super Admins</option>}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((tableUser, index) => (
                <motion.tr
                  key={tableUser.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-warm-500 to-soft-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {(tableUser.firstName?.[0] || '')}{(tableUser.lastName?.[0] || '')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {tableUser.firstName || ''} {tableUser.lastName || ''}
                        </div>
                        <div className="text-sm text-gray-500">
                          {tableUser.email || ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {tableUser.companyName || 'No Company'}
                    </div>
                    {tableUser.companyDomain && (
                      <div className="text-sm text-gray-500">
                        {tableUser.companyDomain}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(tableUser.role || 'user')}`}>
                      {(tableUser.role || 'user').replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      tableUser.emailVerified ? 'bg-soft-100 text-soft-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {tableUser.emailVerified ? 'Active' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tableUser.createdAt ? new Date(tableUser.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleEditUser(tableUser)}
                        className={`p-1 rounded transition-colors ${
                          tableUser.id === user?.id 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-warm-600 hover:text-warm-900'
                        }`}
                        title={tableUser.id === user?.id ? "You cannot edit your own profile" : "Edit user"}
                        disabled={tableUser.id === user?.id}
                      >
                        <SafeIcon icon={FiEdit} className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEmailUser(tableUser)}
                        className="text-soft-600 hover:text-soft-900 p-1 rounded"
                        title="Send email"
                      >
                        <SafeIcon icon={FiMail} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(tableUser.id)}
                        className={`p-1 rounded transition-colors ${
                          tableUser.id === user?.id 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-red-600 hover:text-red-900'
                        }`}
                        title={tableUser.id === user?.id ? "You cannot delete your own account" : "Delete user"}
                        disabled={tableUser.id === user?.id}
                      >
                        <SafeIcon icon={FiTrash} className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <SafeIcon icon={FiMail} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">
              {searchTerm || filterRole !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by inviting your first user.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite User</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg input-popup"
                  placeholder="user@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg input-popup"
                >
                  <option value="user">User</option>
                  {user?.role === 'super_admin' && <option value="admin">Admin</option>}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteUser}
                className="px-4 py-2 bg-gradient-to-r from-warm-500 to-soft-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
              >
                Send Invitation
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit User</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg input-popup"
                  placeholder="First name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg input-popup"
                  placeholder="Last name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg input-popup"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  {user?.role === 'super_admin' && <option value="super_admin">Super Admin</option>}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                  setEditForm({ firstName: '', lastName: '', role: 'user' });
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-gradient-to-r from-warm-500 to-soft-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Email User Modal */}
      {showEmailModal && emailingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-lg w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Send Email to {emailingUser.firstName || emailingUser.email}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To
                </label>
                <input
                  type="email"
                  value={emailingUser.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg input-popup bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg input-popup"
                  placeholder="Email subject"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={emailForm.message}
                  onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg input-popup"
                  placeholder="Your message..."
                  rows={6}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailingUser(null);
                  setEmailForm({ subject: '', message: '' });
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                className="px-4 py-2 bg-gradient-to-r from-warm-500 to-soft-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
              >
                Send Email
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;