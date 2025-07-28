const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../database/connection');
const { body, validationResult } = require('express-validator');
const { sendPasswordResetEmail, sendEmail } = require('../services/emailService');

const router = express.Router();

// Login route
router.post('/login', [
  body('email').isEmail(),
  body('password').isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid input data', errors: errors.array() });
    }

    const { email, password } = req.body;

    // Normalize email to match invitation acceptance behavior
    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        company_id: user.company_id 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Get company info if user has one
    let company = null;
    if (user.company_id) {
      const companyResult = await pool.query(
        'SELECT id, name, domain, industry, size, subscription_status, subscription_plan FROM companies WHERE id = $1',
        [user.company_id]
      );
      if (companyResult.rows.length > 0) {
        company = companyResult.rows[0];
      }
    }

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        email_verified: user.email_verified,
        company_id: user.company_id,
        company
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify token route
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get company info if user has one
    let company = null;
    if (user.company_id) {
      const companyResult = await pool.query(
        'SELECT id, name, domain, industry, size, subscription_status, subscription_plan FROM companies WHERE id = $1',
        [user.company_id]
      );
      if (companyResult.rows.length > 0) {
        company = companyResult.rows[0];
      }
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        email_verified: user.email_verified,
        company_id: user.company_id,
        company
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Signup route
router.post('/signup', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('firstName').isLength({ min: 1 }),
  body('lastName').isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid input data', errors: errors.array() });
    }

    const { email, password, firstName, lastName, companyName } = req.body;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if company already exists
    if (companyName) {
      const existingCompany = await pool.query(
        'SELECT id FROM companies WHERE LOWER(name) = LOWER($1)',
        [companyName]
      );

      if (existingCompany.rows.length > 0) {
        return res.status(400).json({ message: 'Company already exists' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let company_id = null;
      
      // Create company if provided
      if (companyName) {
        const companyResult = await client.query(
          `INSERT INTO companies (name, subscription_status, subscription_plan) 
           VALUES ($1, 'inactive', 'free') RETURNING id`,
          [companyName]
        );
        company_id = companyResult.rows[0].id;
      }

      // Create user as admin (first user of the company)
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified, company_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [email, hashedPassword, firstName, lastName, 'admin', true, company_id]
      );

      await client.query('COMMIT');

      const user = userResult.rows[0];

      // Get company info if user has one
      let company = null;
      if (user.company_id) {
        const companyResult = await client.query(
          'SELECT id, name, domain, industry, size, subscription_status, subscription_plan FROM companies WHERE id = $1',
          [user.company_id]
        );
        if (companyResult.rows.length > 0) {
          company = companyResult.rows[0];
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          company_id: user.company_id 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          email_verified: user.email_verified,
          company_id: user.company_id,
          company
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Forgot password route
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid email' });
    }

    const { email } = req.body;

    // Check if user exists
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token (in a real app, you'd send this via email)
    const resetToken = jwt.sign(
      { email, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Store reset token in database
    await pool.query(
      'UPDATE users SET reset_password_token = $1, reset_password_expires = NOW() + INTERVAL \'1 hour\' WHERE email = $2',
      [resetToken, email]
    );

    // Send password reset email
    try {
      await sendPasswordResetEmail(email, resetToken);
      res.json({ message: 'Password reset email sent' });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      
      // Clear the reset token if email fails
      await pool.query(
        'UPDATE users SET reset_password_token = NULL, reset_password_expires = NULL WHERE email = $1',
        [email]
      );
      
      res.status(500).json({ message: 'Failed to send password reset email. Please try again.' });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reset password route
router.post('/reset-password', [
  body('token').isLength({ min: 1 }),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid input data' });
    }

    const { token, password } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ message: 'Invalid token' });
    }

    // Check if token exists and is not expired
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND reset_password_token = $2 AND reset_password_expires > NOW()',
      [decoded.email, token]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    await pool.query(
      'UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE email = $2',
      [hashedPassword, decoded.email]
    );

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify email route
router.post('/verify-email', [
  body('token').isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    const { token } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'email_verification') {
      return res.status(400).json({ message: 'Invalid token' });
    }

    // Update user email verification status
    const result = await pool.query(
      'UPDATE users SET email_verified = TRUE, email_verification_token = NULL WHERE email = $1 AND email_verification_token = $2 RETURNING id',
      [decoded.email, token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    res.json({ message: 'Email verified successfully' });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Accept invitation route
router.post('/accept-invitation', [
  body('token').isLength({ min: 1 }),
  body('password').isLength({ min: 8 }),
  body('firstName').isLength({ min: 1 }),
  body('lastName').isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid input data', errors: errors.array() });
    }

    const { token, password, firstName, lastName } = req.body;

    // Find invitation
    const invitationResult = await pool.query(
      `SELECT ui.*, c.name as company_name 
       FROM user_invitations ui 
       LEFT JOIN companies c ON ui.company_id = c.id 
       LEFT JOIN users u ON ui.invited_by = u.id
       WHERE ui.token = $1 AND ui.expires_at > NOW() AND ui.accepted_at IS NULL`,
      [token]
    );

    if (invitationResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired invitation' });
    }

    const invitation = invitationResult.rows[0];

    // Normalize the email to match login behavior
    const normalizedEmail = invitation.email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create user with normalized email
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified, company_id) 
         VALUES ($1, $2, $3, $4, $5, true, $6) RETURNING *`,
        [normalizedEmail, hashedPassword, firstName, lastName, invitation.role, invitation.company_id]
      );
      
      // Mark invitation as accepted
      await client.query(
        'UPDATE user_invitations SET accepted_at = NOW() WHERE id = $1',
        [invitation.id]
      );

      await client.query('COMMIT');

      const user = userResult.rows[0];

      // Get company info
      let company = null;
      if (user.company_id) {
        const companyResult = await client.query(
          'SELECT id, name, domain, industry, size, subscription_status, subscription_plan FROM companies WHERE id = $1',
          [user.company_id]
        );
        if (companyResult.rows.length > 0) {
          company = companyResult.rows[0];
        }
      }

      // Generate JWT token
      const jwtToken = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          company_id: user.company_id 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        token: jwtToken,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          email_verified: user.email_verified,
          company_id: user.company_id,
          company
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get invitation details route
router.get('/invitation/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Find invitation
    const invitationResult = await pool.query(
      `SELECT ui.*, c.name as company_name, 
              u.first_name as inviter_first_name, u.last_name as inviter_last_name
       FROM user_invitations ui 
       LEFT JOIN companies c ON ui.company_id = c.id 
       LEFT JOIN users u ON ui.invited_by = u.id
       WHERE ui.token = $1 AND ui.expires_at > NOW() AND ui.accepted_at IS NULL`,
      [token]
    );

    if (invitationResult.rows.length === 0) {
      return res.status(404).json({ message: 'Invalid or expired invitation' });
    }

    const invitation = invitationResult.rows[0];

    res.json({
      email: invitation.email,
      role: invitation.role,
      companyName: invitation.company_name,
      inviterName: `${invitation.inviter_first_name} ${invitation.inviter_last_name}`,
      expiresAt: invitation.expires_at
    });

  } catch (error) {
    console.error('Get invitation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Test email configuration route (for development only)
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Send a test email
    await sendEmail(email, 'Test Email from SaaS Platform', 
      '<h2>Test Email</h2><p>This is a test email to verify your email configuration is working correctly.</p>');
    
    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      message: 'Failed to send test email', 
      error: error.message 
    });
  }
});

module.exports = router; 