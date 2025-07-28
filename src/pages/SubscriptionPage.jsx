import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { subscriptionAPI } from '../services/api';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import toast from 'react-hot-toast';

const { FiCreditCard, FiCheck, FiX, FiDownload, FiCalendar, FiDollarSign } = FiIcons;

function SubscriptionPage() {
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const [subResponse, invoicesResponse] = await Promise.all([
        subscriptionAPI.getSubscription(),
        subscriptionAPI.getInvoices()
      ]);
      setSubscription(subResponse.data);
      setInvoices(invoicesResponse.data);
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (priceId) => {
    try {
      const response = await subscriptionAPI.createCheckoutSession(priceId);
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Failed to create checkout session');
    }
  };

  const handleCancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription?')) {
      try {
        await subscriptionAPI.cancelSubscription();
        toast.success('Subscription cancelled successfully');
        fetchSubscriptionData();
      } catch (error) {
        toast.error('Failed to cancel subscription');
      }
    }
  };

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      priceId: null,
      features: [
        'Up to 3 users',
        'Basic analytics',
        'Email support',
        'Standard features'
      ],
      current: subscription?.plan === 'free'
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'per month',
      priceId: 'price_1234567890',
      features: [
        'Up to 100 users',
        'Advanced analytics',
        'Priority support',
        'Custom branding',
        'API access',
        'Advanced integrations'
      ],
      current: subscription?.plan === 'pro'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      priceId: null,
      features: [
        'Unlimited users',
        'Custom analytics',
        'Dedicated support',
        'White-label solution',
        'Custom integrations',
        'SLA guarantee'
      ],
      current: subscription?.plan === 'enterprise'
    }
  ];

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscription & Billing</h1>
        <p className="text-gray-600">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Subscription */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Subscription</h2>
        
        {subscription ? (
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-warm-50 to-soft-50 rounded-xl">
            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-warm-500 to-soft-500 rounded-xl flex items-center justify-center">
                <SafeIcon icon={FiCreditCard} className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 capitalize">
                  {subscription.plan} Plan
                </h3>
                <p className="text-sm text-gray-600">
                  {subscription.status === 'active' ? 'Active' : 'Inactive'} • 
                  Next billing: {new Date(subscription.nextBilling).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {subscription.plan !== 'free' && (
              <button
                onClick={handleCancelSubscription}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <SafeIcon icon={FiCreditCard} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No active subscription found</p>
          </div>
        )}
      </div>

      {/* Available Plans */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Plans</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`border-2 rounded-xl p-6 ${
                plan.current
                  ? 'border-warm-500 bg-warm-50'
                  : 'border-gray-200 hover:border-gray-300'
              } transition-all duration-200`}
            >
              {plan.current && (
                <div className="text-center mb-4">
                  <span className="bg-warm-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Current Plan
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 ml-2">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <SafeIcon icon={FiCheck} className="text-soft-500 w-4 h-4 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {!plan.current && plan.priceId && (
                <button
                  onClick={() => handleUpgrade(plan.priceId)}
                  className="w-full bg-gradient-to-r from-warm-500 to-soft-500 text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                >
                  Upgrade to {plan.name}
                </button>
              )}

              {!plan.current && !plan.priceId && plan.name === 'Enterprise' && (
                <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                  Contact Sales
                </button>
              )}

              {plan.current && (
                <div className="text-center text-sm text-gray-500">
                  You're currently on this plan
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing History</h2>
        
        {invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <SafeIcon icon={FiDollarSign} className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">
                          #{invoice.number}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <SafeIcon icon={FiCalendar} className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {new Date(invoice.date).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${invoice.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        invoice.status === 'paid' 
                          ? 'bg-soft-100 text-soft-800'
                          : invoice.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-warm-600 hover:text-warm-900 flex items-center space-x-1">
                        <SafeIcon icon={FiDownload} className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <SafeIcon icon={FiDollarSign} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No billing history</h3>
            <p className="text-gray-500">
              Your billing history will appear here once you have active subscriptions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubscriptionPage;