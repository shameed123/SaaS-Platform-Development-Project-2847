import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiMail, FiLock, FiEye, FiEyeOff, FiZap, FiUser, FiBuilding, FiCheckCircle } = FiIcons;

const InvitationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [invitationData, setInvitationData] = useState(null);
  const [loadingInvitation, setLoadingInvitation] = useState(true);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const token = searchParams.get('token');
  const password = watch('password');

  useEffect(() => {
    if (!token) {
      setError('No invitation token found');
      setLoadingInvitation(false);
      return;
    }

    // Fetch invitation details
    const fetchInvitation = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/auth/invitation/${token}`);
        if (!response.ok) {
          throw new Error('Invalid or expired invitation');
        }
        const data = await response.json();
        setInvitationData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoadingInvitation(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/auth/accept-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to accept invitation');
      }

      // Log the user in automatically
      await loginWithToken(result.token, result.user);
      toast.success('Account created successfully! Welcome to the team.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Failed to accept invitation');
    } finally {
      setLoading(false);
    }
  };

  if (loadingInvitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-soft-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-soft-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md w-full space-y-8"
        >
          <div className="text-center">
            <Link to="/" className="inline-flex items-center space-x-2 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-warm-500 to-soft-500 rounded-xl flex items-center justify-center">
                <SafeIcon icon={FiZap} className="text-white text-lg" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-warm-500 to-soft-500 bg-clip-text text-transparent">
                SaaS Pro
              </span>
            </Link>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <SafeIcon icon={FiCheckCircle} className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Invalid Invitation
                </h2>
                <p className="text-gray-600 mb-6">
                  {error}
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-gradient-to-r from-warm-500 to-soft-500 text-white py-3 px-4 rounded-xl font-medium hover:from-warm-600 hover:to-soft-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-warm-500 focus:ring-offset-2"
                >
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-soft-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-warm-500 to-soft-500 rounded-xl flex items-center justify-center">
              <SafeIcon icon={FiZap} className="text-white text-lg" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-warm-500 to-soft-500 bg-clip-text text-transparent">
              SaaS Pro
            </span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">
            Accept Your Invitation
          </h2>
          <p className="mt-2 text-gray-600">
            You've been invited to join{' '}
            <span className="font-semibold text-warm-600">
              {invitationData?.companyName}
            </span>
          </p>
          <p className="text-sm text-gray-500">
            Invited by {invitationData?.inviterName}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon icon={FiMail} className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  disabled
                  value={invitationData?.email || ''}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                  placeholder="Email address"
                />
              </div>
            </div>

            {/* First Name Field */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon icon={FiUser} className="h-5 w-5 text-gray-400" />
                </div>
                                 <input
                   id="firstName"
                   name="firstName"
                   type="text"
                   {...register('firstName', { required: 'First name is required' })}
                   className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl input-popup transition-all duration-200"
                   placeholder="Enter your first name"
                 />
              </div>
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            {/* Last Name Field */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon icon={FiUser} className="h-5 w-5 text-gray-400" />
                </div>
                                 <input
                   id="lastName"
                   name="lastName"
                   type="text"
                   {...register('lastName', { required: 'Last name is required' })}
                   className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl input-popup transition-all duration-200"
                   placeholder="Enter your last name"
                 />
              </div>
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon icon={FiLock} className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' }
                  })}
                  className="input-field-password"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <SafeIcon 
                    icon={showPassword ? FiEyeOff : FiEye} 
                    className="h-5 w-5 text-gray-400 hover:text-gray-600" 
                  />
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon icon={FiLock} className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                  className="input-field-password"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <SafeIcon 
                    icon={showConfirmPassword ? FiEyeOff : FiEye} 
                    className="h-5 w-5 text-gray-400 hover:text-gray-600" 
                  />
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-warm-500 to-soft-500 text-white py-3 px-4 rounded-xl font-medium hover:from-warm-600 hover:to-soft-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-warm-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <SafeIcon icon={FiCheckCircle} className="h-5 w-5 mr-2" />
                    Accept Invitation & Create Account
                  </>
                )}
              </button>
            </div>

            {/* Expiration Notice */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                This invitation expires on{' '}
                {invitationData?.expiresAt ? 
                  new Date(invitationData.expiresAt).toLocaleDateString() : 
                  'Unknown date'
                }
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default InvitationPage; 