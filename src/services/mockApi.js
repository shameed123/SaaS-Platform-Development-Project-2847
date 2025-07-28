/**
 * Mock API implementation for SaaS Platform
 * 
 * This file provides mock implementations of the API methods defined in api.js
 * using the mock data from mockData.js. It simulates backend functionality for testing.
 */

import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { 
  mockUsers, 
  mockCompanies, 
  mockSubscription,
  mockInvoices,
  generateUserGrowthData,
  generateRevenueData,
  generateCompanyStats,
  mockDashboardStats,
  mockSettings
} from './mockData';

// JWT secret key (in a real app, this would be in an environment variable)
const JWT_SECRET = 'your-secret-key';

// Helpers
const findUserByEmail = (email) => {
  return mockUsers.find(user => user.email === email);
};

const findUserById = (id) => {
  return mockUsers.find(user => user.id === id);
};

const findCompanyById = (id) => {
  return mockCompanies.find(company => company.id === id);
};

const getUsersForCompany = (companyId) => {
  return mockUsers.filter(user => user.companyId === companyId);
};

// Mock API implementations
export const mockAuthAPI = {
  login: async (credentials) => {
    const { email, password } = credentials;
    const user = findUserByEmail(email);
    
    if (!user) {
      throw { response: { data: { message: 'User not found' } } };
    }
    
    // In a real app, we'd use bcrypt.compare
    // This is simplified for the mock
    if (user.password !== '$2a$10$XvVzW3rYMZEt6JvMZl7Wpe3BMtHDcvKYS5yVcNMvOUUgBxGQI6nCi') {
      throw { response: { data: { message: 'Invalid password' } } };
    }
    
    if (!user.emailVerified) {
      throw { response: { data: { message: 'Email not verified' } } };
    }
    
    // Create a JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Omit password from returned user
    const { password: _, ...userWithoutPassword } = user;
    
    // Add company info if applicable
    let userWithCompany = { ...userWithoutPassword };
    if (user.companyId) {
      const company = findCompanyById(user.companyId);
      if (company) {
        userWithCompany.company = company;
      }
    }
    
    return { data: { token, user: userWithCompany } };
  },
  
  signup: async (userData) => {
    const { email } = userData;
    
    if (findUserByEmail(email)) {
      throw { response: { data: { message: 'Email already in use' } } };
    }
    
    // In a real app, we'd create the user in the database
    // For the mock, we just return success
    return { data: { message: 'User created successfully' } };
  },
  
  verifyToken: async () => {
    // In a real app, we'd verify the token and fetch the user
    // For the mock, we'll return the first user based on the role in localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      throw { response: { data: { message: 'No token provided' } } };
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = findUserById(decoded.id);
      
      if (!user) {
        throw { response: { data: { message: 'User not found' } } };
      }
      
      // Omit password from returned user
      const { password: _, ...userWithoutPassword } = user;
      
      // Add company info if applicable
      let userWithCompany = { ...userWithoutPassword };
      if (user.companyId) {
        const company = findCompanyById(user.companyId);
        if (company) {
          userWithCompany.company = company;
        }
      }
      
      return { data: { user: userWithCompany } };
    } catch (error) {
      throw { response: { data: { message: 'Invalid token' } } };
    }
  },
  
  forgotPassword: async (data) => {
    const { email } = data;
    const user = findUserByEmail(email);
    
    if (!user) {
      throw { response: { data: { message: 'User not found' } } };
    }
    
    // In a real app, we'd send an email with a reset link
    // For the mock, we just return success
    return { data: { message: 'Password reset email sent' } };
  },
  
  resetPassword: async (data) => {
    const { token, password } = data;
    
    // In a real app, we'd verify the token and update the password
    // For the mock, we just return success
    return { data: { message: 'Password reset successful' } };
  },
  
  verifyEmail: async (data) => {
    const { token } = data;
    
    // In a real app, we'd verify the token and update the user's email verification status
    // For the mock, we just return success
    return { data: { message: 'Email verified successfully' } };
  }
};

export const mockUserAPI = {
  getUsers: async () => {
    // Check the role from the token and return appropriate users
    const token = localStorage.getItem('token');
    if (!token) {
      throw { response: { data: { message: 'No token provided' } } };
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = findUserById(decoded.id);
      
      if (!user) {
        throw { response: { data: { message: 'User not found' } } };
      }
      
      let users = [];
      
      if (user.role === 'super_admin') {
        // Super admin sees all users
        users = mockUsers.map(({ password: _, ...userWithoutPassword }) => userWithoutPassword);
      } else if (user.role === 'admin') {
        // Admin sees users in their company
        users = mockUsers
          .filter(u => u.companyId === user.companyId)
          .map(({ password: _, ...userWithoutPassword }) => userWithoutPassword);
      } else {
        // Regular users don't have access
        throw { response: { data: { message: 'Unauthorized' } } };
      }
      
      return { data: users };
    } catch (error) {
      throw { response: { data: { message: error.message || 'Invalid token' } } };
    }
  },
  
  createUser: async (userData) => {
    // In a real app, we'd create the user in the database
    // For the mock, we just return success with a fake ID
    return { 
      data: { 
        ...userData, 
        id: uuidv4(), 
        createdAt: new Date().toISOString() 
      } 
    };
  },
  
  updateUser: async (id, userData) => {
    // In a real app, we'd update the user in the database
    // For the mock, we just return success
    return { 
      data: { 
        ...userData, 
        id, 
        updatedAt: new Date().toISOString() 
      } 
    };
  },
  
  deleteUser: async (id) => {
    // In a real app, we'd delete the user from the database
    // For the mock, we just return success
    return { data: { message: 'User deleted successfully' } };
  },
  
  inviteUser: async (data) => {
    // In a real app, we'd send an invitation email
    // For the mock, we just return success
    return { data: { message: 'Invitation sent successfully' } };
  }
};

export const mockCompanyAPI = {
  getCompanies: async () => {
    // Check the role from the token and return appropriate companies
    const token = localStorage.getItem('token');
    if (!token) {
      throw { response: { data: { message: 'No token provided' } } };
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = findUserById(decoded.id);
      
      if (!user) {
        throw { response: { data: { message: 'User not found' } } };
      }
      
      if (user.role === 'super_admin') {
        // Super admin sees all companies
        return { data: mockCompanies };
      } else {
        // Others only see their own company
        const company = findCompanyById(user.companyId);
        return { data: company ? [company] : [] };
      }
    } catch (error) {
      throw { response: { data: { message: 'Invalid token' } } };
    }
  },
  
  createCompany: async (companyData) => {
    // In a real app, we'd create the company in the database
    // For the mock, we just return success with a fake ID
    return { 
      data: { 
        ...companyData, 
        id: uuidv4(), 
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userCount: 0,
        subscription: {
          status: 'inactive',
          plan: 'free'
        }
      } 
    };
  },
  
  updateCompany: async (id, companyData) => {
    // In a real app, we'd update the company in the database
    // For the mock, we just return success
    return { 
      data: { 
        ...companyData, 
        id, 
        updatedAt: new Date().toISOString() 
      } 
    };
  },
  
  deleteCompany: async (id) => {
    // In a real app, we'd delete the company from the database
    // For the mock, we just return success
    return { data: { message: 'Company deleted successfully' } };
  }
};

export const mockSubscriptionAPI = {
  getSubscription: async () => {
    // In a real app, we'd fetch the subscription from Stripe
    // For the mock, we just return a fake subscription
    return { data: mockSubscription };
  },
  
  createCheckoutSession: async (priceId) => {
    // In a real app, this would create a Stripe checkout session
    // For the mock, we just return a fake URL
    return { data: { url: '#/dashboard/subscription?success=true' } };
  },
  
  cancelSubscription: async () => {
    // In a real app, this would cancel the subscription in Stripe
    // For the mock, we just return success
    return { data: { message: 'Subscription cancelled successfully' } };
  },
  
  getInvoices: async () => {
    // In a real app, we'd fetch invoices from Stripe
    // For the mock, we just return fake invoices
    return { data: mockInvoices };
  }
};

export const mockAnalyticsAPI = {
  getDashboardStats: async () => {
    // In a real app, we'd calculate these stats from the database
    // For the mock, we just return fake stats
    return { data: mockDashboardStats };
  },
  
  getUserGrowth: async () => {
    // In a real app, we'd calculate this from the database
    // For the mock, we just return fake data
    return { data: generateUserGrowthData() };
  },
  
  getRevenueStats: async () => {
    // In a real app, we'd calculate this from Stripe data
    // For the mock, we just return fake data
    return { data: generateRevenueData() };
  },
  
  getCompanyStats: async () => {
    // In a real app, we'd calculate this from the database
    // For the mock, we just return fake data
    return { data: generateCompanyStats() };
  }
};

export const mockSettingsAPI = {
  getSettings: async () => {
    // In a real app, we'd fetch these from the database
    // For the mock, we just return fake settings
    return { data: mockSettings };
  },
  
  updateSettings: async (settings) => {
    // In a real app, we'd update these in the database
    // For the mock, we just return the updated settings
    return { data: settings };
  }
};