import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiUser, FiMail, FiBuilding, FiCalendar, FiActivity, FiClock } = FiIcons;

function UserDashboard() {
  const { user } = useAuth();
  const [recentActivity] = useState([
    { id: 1, action: 'Updated profile', time: '2 hours ago', icon: FiUser },
    { id: 2, action: 'Logged in', time: '1 day ago', icon: FiActivity },
    { id: 3, action: 'Changed password', time: '3 days ago', icon: FiUser },
  ]);

  const quickStats = [
    {
      title: 'Account Status',
      value: 'Active',
      icon: FiActivity,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Member Since',
      value: new Date(user?.createdAt || Date.now()).toLocaleDateString(),
      icon: FiCalendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Last Login',
      value: 'Today',
      icon: FiClock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-blue-100">
          Here's what's happening with your account today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickStats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                <SafeIcon icon={stat.icon} className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Summary */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Summary</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <SafeIcon icon={FiUser} className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-semibold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <SafeIcon icon={FiMail} className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Email Address</p>
                <p className="font-semibold text-gray-900">{user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <SafeIcon icon={FiBuilding} className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Company</p>
                <p className="font-semibold text-gray-900">{user?.company?.name || 'Not assigned'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <SafeIcon icon={activity.icon} className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group">
            <SafeIcon icon={FiUser} className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 group-hover:text-blue-600">
              Update Profile
            </p>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 group">
            <SafeIcon icon={FiMail} className="w-8 h-8 text-gray-400 group-hover:text-purple-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 group-hover:text-purple-600">
              Contact Support
            </p>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 group">
            <SafeIcon icon={FiActivity} className="w-8 h-8 text-gray-400 group-hover:text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 group-hover:text-green-600">
              View Activity
            </p>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default UserDashboard;