const express = require('express');
const { pool } = require('../database/connection');

const router = express.Router();

// Get settings for current user's company or global settings
router.get('/', async (req, res) => {
  try {
    const companyId = req.user.company_id;
    let settings = {
      companyLabel: 'Company',
      maxAdminsPerCompany: 5,
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
          maxUsers: -1,
          emailSupport: true,
          customBranding: true,
          analytics: 'premium',
          dedicatedSupport: true
        }
      }
    };

    try {
      // Try to get global settings first
      const globalResult = await pool.query(
        'SELECT key, value FROM global_settings'
      );
      
      // Parse global settings
      globalResult.rows.forEach(row => {
        try {
          // The value is already an object, no need to parse JSON
          const value = row.value;
          if (row.key === 'company_label') {
            settings.companyLabel = value.value;
          } else if (row.key === 'max_admins_per_company') {
            settings.maxAdminsPerCompany = value.value;
          } else if (row.key === 'plan_features') {
            // Convert snake_case to camelCase for plan features
            settings.planFeatures = {
              free: {
                maxUsers: value.free?.max_users || 3,
                emailSupport: value.free?.email_support || false,
                customBranding: value.free?.custom_branding || false,
                analytics: value.free?.analytics || 'basic'
              },
              pro: {
                maxUsers: value.pro?.max_users || 100,
                emailSupport: value.pro?.email_support || true,
                customBranding: value.pro?.custom_branding || true,
                analytics: value.pro?.analytics || 'advanced'
              },
              enterprise: {
                maxUsers: value.enterprise?.max_users || -1,
                emailSupport: value.enterprise?.email_support || true,
                customBranding: value.enterprise?.custom_branding || true,
                analytics: value.enterprise?.analytics || 'premium',
                dedicatedSupport: value.enterprise?.dedicated_support || true
              }
            };
          }
        } catch (e) {
          console.error('Error processing global setting:', row.key, e);
        }
      });

      // If user has a company, get company-specific settings
      if (companyId) {
        const companyResult = await pool.query(
          'SELECT key, value FROM settings WHERE company_id = $1',
          [companyId]
        );
        
        // Override with company-specific settings
        companyResult.rows.forEach(row => {
          try {
            // The value is already an object, no need to parse JSON
            const value = row.value;
            if (row.key === 'company_label') {
              settings.companyLabel = value.value || value;
            }
            // Add other company-specific overrides as needed
          } catch (e) {
            console.error('Error processing company setting:', row.key, e);
          }
        });
      }
    } catch (dbError) {
      console.error('Database error fetching settings:', dbError);
      // Return default settings if database fails
    }

    res.json(settings);
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