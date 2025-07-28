const express = require('express');
const { pool } = require('../database/connection');

const router = express.Router();

// Get all users (with company info)
router.get('/', async (req, res) => {
  try {
    let query = `
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.role, 
        u.email_verified, u.created_at, u.updated_at,
        c.id as company_id, c.name as company_name, c.domain as company_domain
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
    `;
    
    const queryParams = [];
    
    // Filter users based on role
    if (req.user.role === 'super_admin') {
      // Super admin can see all users
      query += ` ORDER BY u.created_at DESC`;
    } else if (req.user.role === 'admin') {
      // Admin can only see users from their company
      query += ` WHERE u.company_id = $1 ORDER BY u.created_at DESC`;
      queryParams.push(req.user.company_id);
    } else {
      // Regular users can only see themselves
      query += ` WHERE u.id = $1 ORDER BY u.created_at DESC`;
      queryParams.push(req.user.id);
    }

    const result = await pool.query(query, queryParams);

    // Transform the data to match frontend expectations (camelCase)
    const users = result.rows.map(row => ({
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role,
      emailVerified: row.email_verified,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      companyId: row.company_id,
      companyName: row.company_name,
      companyDomain: row.company_domain
    }));

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.role, 
        u.email_verified, u.created_at, u.updated_at,
        c.id as company_id, c.name as company_name, c.domain as company_domain
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      WHERE u.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const row = result.rows[0];
    // Transform the data to match frontend expectations (camelCase)
    const user = {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role,
      emailVerified: row.email_verified,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      companyId: row.company_id,
      companyName: row.company_name,
      companyDomain: row.company_domain
    };

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new user
router.post('/', async (req, res) => {
  try {
    const { email, first_name, last_name, role } = req.body;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Use the current user's company_id for new users
    const companyId = req.user.role === 'super_admin' ? null : req.user.company_id;

    // Create user (without password - they'll need to set it via invitation)
    const result = await pool.query(
      `INSERT INTO users (email, first_name, last_name, role, company_id, email_verified) 
       VALUES ($1, $2, $3, $4, $5, false) RETURNING *`,
      [email, first_name, last_name, role || 'user', companyId]
    );

    const row = result.rows[0];
    // Transform the data to match frontend expectations (camelCase)
    const user = {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role,
      emailVerified: row.email_verified,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      companyId: row.company_id
    };

    res.status(201).json(user);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, role } = req.body;

    // Check if user exists and user has permission to update them
    let whereClause = 'id = $1';
    const queryParams = [id];

    if (req.user.role === 'admin') {
      // Admin can only update users from their company
      whereClause = 'id = $1 AND company_id = $2';
      queryParams.push(req.user.company_id);
    } else if (req.user.role === 'user') {
      // Regular users can only update themselves
      whereClause = 'id = $1 AND id = $2';
      queryParams.push(req.user.id);
    }
    // Super admin can update any user

    const result = await pool.query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, role = $3, updated_at = CURRENT_TIMESTAMP
       WHERE ${whereClause} RETURNING *`,
      [first_name, last_name, role, ...queryParams]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found or access denied' });
    }

    const row = result.rows[0];
    // Transform the data to match frontend expectations (camelCase)
    const user = {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role,
      emailVerified: row.email_verified,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      companyId: row.company_id
    };

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists and user has permission to delete them
    let whereClause = 'id = $1';
    const queryParams = [id];

    if (req.user.role === 'admin') {
      // Admin can only delete users from their company
      whereClause = 'id = $1 AND company_id = $2';
      queryParams.push(req.user.company_id);
    } else if (req.user.role === 'user') {
      // Regular users cannot delete other users
      return res.status(403).json({ message: 'Access denied' });
    }
    // Super admin can delete any user

    const result = await pool.query(
      `DELETE FROM users WHERE ${whereClause} RETURNING id`,
      queryParams
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found or access denied' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Invite user
router.post('/invite', async (req, res) => {
  try {
    const { email, role } = req.body;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Use the current user's company_id for the invitation
    const companyId = req.user.company_id;

    // Generate invitation token
    const invitationToken = require('crypto').randomBytes(32).toString('hex');

    // Create invitation record
    const result = await pool.query(
      `INSERT INTO user_invitations (email, company_id, role, token, expires_at) 
       VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days') RETURNING *`,
      [email, companyId, role || 'user', invitationToken]
    );

    // In a real app, send invitation email here
    console.log(`Invitation token for ${email}: ${invitationToken}`);

    res.status(201).json({ 
      message: 'Invitation sent successfully',
      invitation: result.rows[0]
    });
  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 