import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../../services/api';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const { FiUsers, FiBuilding, FiDollarSign, FiTrendingUp, FiSettings, FiEye, FiPlus } = FiIcons;

function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalRevenue: 0,
    activeSubscriptions: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [companyStats, setCompanyStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, revenueResponse, companyResponse] = await Promise.all([
        analyticsAPI.getDashboardStats(),
        analyticsAPI.getRevenueStats(),
        analyticsAPI.getCompanyStats()
      ]);
      setStats(statsResponse.data);
      setRevenueData(revenueResponse.data);
      // Ensure companyStats is always an array
      setCompanyStats(Array.isArray(companyResponse.data) ? companyResponse.data : []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set default values on error
      setCompanyStats([]);
      setRevenueData([]);
    } finally {
      setLoading(false);
    }
  };

  const quickStats = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: FiUsers,
              color: 'text-teal-600',
        bgColor: 'bg-teal-100',
      change: '+12%'
    },
    {
      title: 'Total Companies',
      value: stats.totalCompanies,
      icon: FiBuilding,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+8%'
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.totalRevenue?.toLocaleString() || 0}`,
      icon: FiDollarSign,
              color: 'text-cyan-600',
        bgColor: 'bg-cyan-100',
      change: '+25%'
    },
    {
      title: 'Active Subscriptions',
      value: stats.activeSubscriptions,
      icon: FiTrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '+18%'
    }
  ];

  const quickActions = [
    {
      title: 'Platform Settings',
      description: 'Configure global settings',
      icon: FiSettings,
      color: 'teal',
      href: '/dashboard/settings'
    },
    {
      title: 'View Analytics',
      description: 'Detailed platform metrics',
      icon: FiEye,
      color: 'cyan',
      href: '/dashboard/analytics'
    },
    {
      title: 'Manage Companies',
      description: 'Company management',
      icon: FiBuilding,
      color: 'green',
      href: '/dashboard/companies'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Super Admin Dashboard
        </h1>
                  <p className="text-teal-100">
          Monitor platform-wide metrics and manage global settings.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                <SafeIcon icon={stat.icon} className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="text-sm font-medium text-green-600">{stat.change}</span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Trends</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Companies */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top Companies by Users</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Array.isArray(companyStats) ? companyStats.slice(0, 5) : []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="userCount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className={`block p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 group ${
                  action.color === 'teal' ? 'hover:border-teal-500 hover:bg-teal-50' :
                  action.color === 'cyan' ? 'hover:border-cyan-500 hover:bg-cyan-50' :
                  'hover:border-green-500 hover:bg-green-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    action.color === 'teal' ? 'bg-teal-100 group-hover:bg-teal-200' :
                    action.color === 'cyan' ? 'bg-cyan-100 group-hover:bg-cyan-200' :
                    'bg-green-100 group-hover:bg-green-200'
                  }`}>
                    <SafeIcon icon={action.icon} className={`w-5 h-5 ${
                      action.color === 'teal' ? 'text-teal-600' :
                      action.color === 'cyan' ? 'text-cyan-600' :
                      'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">Database</span>
              <span className="text-sm text-green-600 font-semibold">Healthy</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">API Server</span>
              <span className="text-sm text-green-600 font-semibold">Online</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">Payment System</span>
              <span className="text-sm text-green-600 font-semibold">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">Email Service</span>
              <span className="text-sm text-yellow-600 font-semibold">Monitoring</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default SuperAdminDashboard;