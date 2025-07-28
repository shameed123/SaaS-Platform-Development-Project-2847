import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiMail, FiCheck, FiX, FiZap } = FiIcons;

function EmailVerificationPage() {
  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, success, error
  const [searchParams] = useSearchParams();
  const { verifyEmail } = useAuth();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      handleVerification();
    }
  }, [token]);

  const handleVerification = async () => {
    const result = await verifyEmail(token);
    setVerificationStatus(result.success ? 'success' : 'error');
  };

  const getStatusContent = () => {
    switch (verificationStatus) {
      case 'success':
        return {
          icon: FiCheck,
          iconColor: 'text-green-600',
          bgColor: 'bg-green-100',
          title: 'Email Verified!',
          message: 'Your email has been successfully verified. You can now sign in to your account.',
                      action: (
              <Link
                to="/login"
                className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
              >
                Sign In
              </Link>
            )
        };
      case 'error':
        return {
          icon: FiX,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-100',
          title: 'Verification Failed',
          message: 'The verification link is invalid or has expired. Please request a new verification email.',
                      action: (
              <Link
                to="/signup"
                className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
              >
                Sign Up Again
              </Link>
            )
        };
              default:
          return {
            icon: FiMail,
            iconColor: 'text-teal-600',
            bgColor: 'bg-teal-100',
            title: token ? 'Verifying...' : 'Check Your Email',
            message: token 
              ? 'Please wait while we verify your email address.'
              : 'We\'ve sent a verification email to your address. Please check your inbox and click the verification link.',
            action: !token && (
              <Link
                to="/login"
                className="text-teal-600 hover:text-teal-500 font-semibold transition-colors"
              >
                Back to Login
              </Link>
            )
          };
    }
  };

  const content = getStatusContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <SafeIcon icon={FiZap} className="text-white text-lg" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
              SaaS Pro
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className={`w-16 h-16 ${content.bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
            <SafeIcon icon={content.icon} className={`w-8 h-8 ${content.iconColor}`} />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {content.title}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {content.message}
          </p>
          
          {content.action}
        </div>
      </motion.div>
    </div>
  );
}

export default EmailVerificationPage;