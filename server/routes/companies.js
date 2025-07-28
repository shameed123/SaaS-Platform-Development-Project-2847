const express = require('express');
const { pool } = require('../database/connection');

const router = express.Router();

// Get all companies
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.*,
        COUNT(u.id) as user_count
      FROM companies c
      LEFT JOIN users u ON c.id = u.company_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get company by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        c.*,
        COUNT(u.id) as user_count
      FROM companies c
      LEFT JOIN users u ON c.id = u.company_id
      WHERE c.id = $1
      GROUP BY c.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new company
router.post('/', async (req, res) => {
  try {
    const { name, domain, industry, size, subscription_plan } = req.body;

    const result = await pool.query(
      `INSERT INTO companies (name, domain, industry, size, subscription_plan, subscription_status) 
       VALUES ($1, $2, $3, $4, $5, 'inactive') RETURNING *`,
      [name, domain, industry, size, subscription_plan || 'free']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update company
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, domain, industry, size, subscription_plan, subscription_status } = req.body;

    const result = await pool.query(
      `UPDATE companies 
       SET name = $1, domain = $2, industry = $3, size = $4, 
           subscription_plan = $5, subscription_status = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [name, domain, industry, size, subscription_plan, subscription_status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete company
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM companies WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 