const express = require('express');
const { pool } = require('../database/connection');

const router = express.Router();

// Get subscription for current user's company
router.get('/', async (req, res) => {
  try {
    const companyId = req.user.company_id;
    
    if (!companyId) {
      return res.status(400).json({ message: 'No company associated with user' });
    }

    const result = await pool.query(
      'SELECT * FROM subscriptions WHERE company_id = $1 ORDER BY created_at DESC LIMIT 1',
      [companyId]
    );

    if (result.rows.length === 0) {
      return res.json({ 
        status: 'inactive',
        plan_type: 'free',
        message: 'No active subscription found'
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get invoices for current user's company
router.get('/invoices', async (req, res) => {
  try {
    const companyId = req.user.company_id;
    
    if (!companyId) {
      return res.status(400).json({ message: 'No company associated with user' });
    }

    const result = await pool.query(
      'SELECT * FROM invoices WHERE company_id = $1 ORDER BY invoice_date DESC',
      [companyId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create checkout session (placeholder for Stripe integration)
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { priceId } = req.body;
    const companyId = req.user.company_id;

    if (!companyId) {
      return res.status(400).json({ message: 'No company associated with user' });
    }

    // In a real implementation, this would integrate with Stripe
    // For now, we'll create a mock checkout session
    const checkoutSession = {
      id: 'cs_' + Math.random().toString(36).substr(2, 9),
      url: 'https://checkout.stripe.com/pay/cs_test_...',
      priceId: priceId
    };

    res.json(checkoutSession);
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cancel subscription
router.post('/cancel', async (req, res) => {
  try {
    const companyId = req.user.company_id;
    
    if (!companyId) {
      return res.status(400).json({ message: 'No company associated with user' });
    }

    const result = await pool.query(
      `UPDATE subscriptions 
       SET status = 'cancelled', cancel_at_period_end = true, updated_at = CURRENT_TIMESTAMP
       WHERE company_id = $1 AND status = 'active' RETURNING *`,
      [companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    res.json({ message: 'Subscription cancelled successfully', subscription: result.rows[0] });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 