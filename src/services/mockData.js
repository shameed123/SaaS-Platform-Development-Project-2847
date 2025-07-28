/**
 * Mock Data for SaaS Platform Testing
 * 
 * This file contains mock data for testing the SaaS platform without a backend.
 * It includes users with different roles, companies, subscriptions, analytics data, etc.
 */

import { v4 as uuidv4 } from 'uuid';
import { addDays, subDays, format } from 'date-fns';

// Mock Users
export const mockUsers = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Admin',
    email: 'admin@example.com',
    role: 'admin',
    password: '$2a$10$XvVzW3rYMZEt6JvMZl7Wpe3BMtHDcvKYS5yVcNMvOUUgBxGQI6nCi', // password123
    emailVerified: true,
    companyId: '1',
    createdAt: subDays(new Date(), 120).toISOString(),
    planId: 'pro'
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Super',
    email: 'super@example.com',
    role: 'super_admin',
    password: '$2a$10$XvVzW3rYMZEt6JvMZl7Wpe3BMtHDcvKYS5yVcNMvOUUgBxGQI6nCi', // password123
    emailVerified: true,
    companyId: null,
    createdAt: subDays(new Date(), 150).toISOString(),
    planId: null
  },
  {
    id: '3',
    firstName: 'Bob',
    lastName: 'User',
    email: 'user@example.com',
    role: 'user',
    password: '$2a$10$XvVzW3rYMZEt6JvMZl7Wpe3BMtHDcvKYS5yVcNMvOUUgBxGQI6nCi', // password123
    emailVerified: true,
    companyId: '1',
    createdAt: subDays(new Date(), 90).toISOString(),
    planId: 'pro'
  },
  {
    id: '4',
    firstName: 'Alice',
    lastName: 'Manager',
    email: 'alice@acme.com',
    role: 'admin',
    password: '$2a$10$XvVzW3rYMZEt6JvMZl7Wpe3BMtHDcvKYS5yVcNMvOUUgBxGQI6nCi',
    emailVerified: true,
    companyId: '2',
    createdAt: subDays(new Date(), 85).toISOString(),
    planId: 'free'
  },
  {
    id: '5',
    firstName: 'Mike',
    lastName: 'Employee',
    email: 'mike@acme.com',
    role: 'user',
    password: '$2a$10$XvVzW3rYMZEt6JvMZl7Wpe3BMtHDcvKYS5yVcNMvOUUgBxGQI6nCi',
    emailVerified: true,
    companyId: '2',
    createdAt: subDays(new Date(), 80).toISOString(),
    planId: 'free'
  },
  {
    id: '6',
    firstName: 'Sarah',
    lastName: 'Tech',
    email: 'sarah@techcorp.com',
    role: 'admin',
    password: '$2a$10$XvVzW3rYMZEt6JvMZl7Wpe3BMtHDcvKYS5yVcNMvOUUgBxGQI6nCi',
    emailVerified: true,
    companyId: '3',
    createdAt: subDays(new Date(), 65).toISOString(),
    planId: 'pro'
  },
  {
    id: '7',
    firstName: 'David',
    lastName: 'Developer',
    email: 'david@techcorp.com',
    role: 'user',
    password: '$2a$10$XvVzW3rYMZEt6JvMZl7Wpe3BMtHDcvKYS5yVcNMvOUUgBxGQI6nCi',
    emailVerified: false,
    companyId: '3',
    createdAt: subDays(new Date(), 45).toISOString(),
    planId: 'pro'
  },
  {
    id: '8',
    firstName: 'Emma',
    lastName: 'Designer',
    email: 'emma@techcorp.com',
    role: 'user',
    password: '$2a$10$XvVzW3rYMZEt6JvMZl7Wpe3BMtHDcvKYS5yVcNMvOUUgBxGQI6nCi',
    emailVerified: true,
    companyId: '3',
    createdAt: subDays(new Date(), 40).toISOString(),
    planId: 'pro'
  },
  {
    id: '9',
    firstName: 'Tom',
    lastName: 'Marketer',
    email: 'tom@startup.io',
    role: 'admin',
    password: '$2a$10$XvVzW3rYMZEt6JvMZl7Wpe3BMtHDcvKYS5yVcNMvOUUgBxGQI6nCi',
    emailVerified: true,
    companyId: '4',
    createdAt: subDays(new Date(), 30).toISOString(),
    planId: 'enterprise'
  },
  {
    id: '10',
    firstName: 'Lisa',
    lastName: 'Growth',
    email: 'lisa@startup.io',
    role: 'user',
    password: '$2a$10$XvVzW3rYMZEt6JvMZl7Wpe3BMtHDcvKYS5yVcNMvOUUgBxGQI6nCi',
    emailVerified: true,
    companyId: '4',
    createdAt: subDays(new Date(), 28).toISOString(),
    planId: 'enterprise'
  }
];

// Mock Companies
export const mockCompanies = [
  {
    id: '1',
    name: 'Example Corp',
    slug: 'example-corp',
    createdAt: subDays(new Date(), 120).toISOString(),
    updatedAt: subDays(new Date(), 10).toISOString(),
    userCount: 2,
    subscription: {
      status: 'active',
      plan: 'pro'
    }
  },
  {
    id: '2',
    name: 'Acme Inc',
    slug: 'acme-inc',
    createdAt: subDays(new Date(), 100).toISOString(),
    updatedAt: subDays(new Date(), 15).toISOString(),
    userCount: 2,
    subscription: {
      status: 'active',
      plan: 'free'
    }
  },
  {
    id: '3',
    name: 'Tech Corp',
    slug: 'tech-corp',
    createdAt: subDays(new Date(), 65).toISOString(),
    updatedAt: subDays(new Date(), 5).toISOString(),
    userCount: 3,
    subscription: {
      status: 'active',
      plan: 'pro'
    }
  },
  {
    id: '4',
    name: 'Startup.io',
    slug: 'startup-io',
    createdAt: subDays(new Date(), 30).toISOString(),
    updatedAt: subDays(new Date(), 2).toISOString(),
    userCount: 2,
    subscription: {
      status: 'active',
      plan: 'enterprise'
    }
  },
  {
    id: '5',
    name: 'Global Solutions',
    slug: 'global-solutions',
    createdAt: subDays(new Date(), 20).toISOString(),
    updatedAt: subDays(new Date(), 3).toISOString(),
    userCount: 0,
    subscription: {
      status: 'inactive',
      plan: 'free'
    }
  }
];

// Mock Subscriptions
export const mockSubscription = {
  id: 'sub_123456',
  plan: 'pro',
  status: 'active',
  nextBilling: addDays(new Date(), 15).toISOString(),
  createdAt: subDays(new Date(), 45).toISOString()
};

// Mock Invoices
export const mockInvoices = [
  {
    id: 'inv_12345',
    number: '001',
    date: subDays(new Date(), 45).toISOString(),
    amount: 29.00,
    status: 'paid'
  },
  {
    id: 'inv_12346',
    number: '002',
    date: subDays(new Date(), 15).toISOString(),
    amount: 29.00,
    status: 'paid'
  },
  {
    id: 'inv_12347',
    number: '003',
    date: addDays(new Date(), 15).toISOString(),
    amount: 29.00,
    status: 'pending'
  }
];

// Generate mock data for user growth chart
export const generateUserGrowthData = () => {
  const data = [];
  const today = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, 'MMM dd');
    
    // Generate a growing number of users over time
    // Start with 10 users and add a random number each day
    const baseUsers = 10 + (30 - i) * 3;
    const randomGrowth = Math.floor(Math.random() * 5);
    
    data.push({
      date: dateStr,
      users: baseUsers + randomGrowth
    });
  }
  
  return data;
};

// Generate mock data for revenue chart
export const generateRevenueData = () => {
  const data = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  months.forEach((month, index) => {
    // Generate revenue with an upward trend and some variation
    const baseRevenue = 1000 + index * 500;
    const variation = Math.floor(Math.random() * 500);
    
    data.push({
      month,
      revenue: baseRevenue + variation
    });
  });
  
  return data;
};

// Generate mock company stats
export const generateCompanyStats = () => {
  return mockCompanies.map(company => ({
    name: company.name,
    userCount: company.userCount,
    revenue: company.subscription.plan === 'free' ? 0 : 
             company.subscription.plan === 'pro' ? 29 * company.userCount : 
             company.subscription.plan === 'enterprise' ? 99 * company.userCount : 0
  }));
};

// Mock dashboard stats
export const mockDashboardStats = {
  totalUsers: mockUsers.length - 1, // Excluding super_admin
  activeUsers: mockUsers.filter(user => user.emailVerified).length - 1, // Excluding super_admin
  totalCompanies: mockCompanies.length,
  activeSubscriptions: mockCompanies.filter(company => company.subscription.status === 'active').length,
  totalRevenue: 1450,
  monthlyRevenue: 290
};

// Mock Settings
export const mockSettings = {
  companyLabel: 'Company',
  maxAdminsPerCompany: 0,
  passwordMinLength: 8,
  sessionTimeout: 60,
  requireEmailVerification: true,
  enableTwoFactor: false,
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
    },
    enterprise: {
      maxUsers: 1000,
      emailSupport: true,
      customBranding: true,
      analytics: 'advanced',
      dedicatedSupport: true,
      sla: true
    }
  }
};