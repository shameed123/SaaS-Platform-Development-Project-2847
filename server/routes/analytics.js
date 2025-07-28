const express = require('express');
const { pool } = require('../database/connection');

const router = express.Router();

// Get dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    // Get total users
    const usersResult = await pool.query('SELECT COUNT(*) as total_users FROM users');
    
    // Get total companies
    const companiesResult = await pool.query('SELECT COUNT(*) as total_companies FROM companies');
    
    // Get active subscriptions
    const subscriptionsResult = await pool.query("SELECT COUNT(*) as active_subscriptions FROM subscriptions WHERE status = 'active'");
    
    // Get total revenue (from invoices)
    const revenueResult = await pool.query("SELECT COALESCE(SUM(amount), 0) as total_revenue FROM invoices WHERE status = 'paid'");

    const stats = {
      totalUsers: parseInt(usersResult.rows[0].total_users),
      totalCompanies: parseInt(companiesResult.rows[0].total_companies),
      activeSubscriptions: parseInt(subscriptionsResult.rows[0].active_subscriptions),
      totalRevenue: parseInt(revenueResult.rows[0].total_revenue) / 100, // Convert from cents to dollars
      chartData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Users',
            data: [12, 19, 3, 5, 2, 3],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }
        ]
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user growth data
router.get('/user-growth', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as new_users
      FROM users 
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `);

    const growthData = result.rows.map(row => ({
      month: row.month.toISOString().slice(0, 7), // YYYY-MM format
      newUsers: parseInt(row.new_users)
    }));

    res.json(growthData);
  } catch (error) {
    console.error('Get user growth error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get revenue stats
router.get('/revenue', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        DATE_TRUNC('month', invoice_date) as month,
        SUM(amount) as revenue
      FROM invoices 
      WHERE status = 'paid' AND invoice_date >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', invoice_date)
      ORDER BY month
    `);

    const revenueData = result.rows.map(row => ({
      month: row.month.toISOString().slice(0, 7), // YYYY-MM format
      revenue: parseInt(row.revenue) / 100 // Convert from cents to dollars
    }));

    res.json(revenueData);
  } catch (error) {
    console.error('Get revenue stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get company stats
router.get('/companies', async (req, res) => {
  try {
    // Get top companies by user count
    const topCompaniesResult = await pool.query(`
      SELECT 
        c.name,
        COUNT(u.id) as user_count
      FROM companies c
      LEFT JOIN users u ON c.id = u.company_id
      GROUP BY c.id, c.name
      ORDER BY user_count DESC
      LIMIT 10
    `);

    // Transform the data to match frontend expectations
    const companyStats = topCompaniesResult.rows.map(row => ({
      name: row.name || 'Unknown Company',
      userCount: parseInt(row.user_count) || 0
    }));

    res.json(companyStats);
  } catch (error) {
    console.error('Get company stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 