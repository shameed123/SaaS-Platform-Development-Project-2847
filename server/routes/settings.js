const express = require('express');
const { pool } = require('../database/connection');

const router = express.Router();

// Get settings for current user's company
router.get('/', async (req, res) => {
  try {
    const companyId = req.user.company_id;
    if (!companyId) {
      return res.status(400).json({ message: 'No company associated with user' });
    }
    const result = await pool.query(
      'SELECT key, value FROM settings WHERE company_id = $1',
      [companyId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update settings for current user's company
router.put('/', async (req, res) => {
  try {
    const companyId = req.user.company_id;
    if (!companyId) {
      return res.status(400).json({ message: 'No company associated with user' });
    }
    const settings = req.body;
    for (const key in settings) {
      await pool.query(
        `INSERT INTO settings (company_id, key, value) VALUES ($1, $2, $3)
         ON CONFLICT (company_id, key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
        [companyId, key, JSON.stringify(settings[key])]
      );
    }
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 