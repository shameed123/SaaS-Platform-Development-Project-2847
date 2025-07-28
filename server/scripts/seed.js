const bcrypt = require('bcryptjs');
const { pool } = require('../database/connection');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Hash password for test users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Insert test companies
    const companies = [
      {
        name: 'TechCorp Inc',
        domain: 'techcorp.com',
        industry: 'Technology',
        size: '50-100',
        subscription_status: 'active',
        subscription_plan: 'pro'
      },
      {
        name: 'StartupXYZ',
        domain: 'startupxyz.com',
        industry: 'SaaS',
        size: '10-50',
        subscription_status: 'active',
        subscription_plan: 'pro'
      },
      {
        name: 'Enterprise Solutions',
        domain: 'enterprise.com',
        industry: 'Consulting',
        size: '100+',
        subscription_status: 'active',
        subscription_plan: 'enterprise'
      },
      {
        name: 'Small Business Co',
        domain: 'smallbiz.com',
        industry: 'Retail',
        size: '1-10',
        subscription_status: 'inactive',
        subscription_plan: 'free'
      },
      {
        name: 'Freelance Pro',
        domain: 'freelance.com',
        industry: 'Services',
        size: '1-10',
        subscription_status: 'inactive',
        subscription_plan: 'free'
      }
    ];
    
    console.log('🏢 Inserting companies...');
    const companyIds = [];
    for (const company of companies) {
      const result = await pool.query(
        `INSERT INTO companies (name, domain, industry, size, subscription_status, subscription_plan) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [company.name, company.domain, company.industry, company.size, company.subscription_status, company.subscription_plan]
      );
      companyIds.push(result.rows[0].id);
      console.log(`   ✅ Created company: ${company.name}`);
    }
    
    // Insert test users
    const users = [
      {
        email: 'super@example.com',
        first_name: 'Jane',
        last_name: 'Super',
        role: 'super_admin',
        email_verified: true,
        company_id: null
      },
      {
        email: 'admin@example.com',
        first_name: 'John',
        last_name: 'Admin',
        role: 'admin',
        email_verified: true,
        company_id: companyIds[0] // TechCorp Inc
      },
      {
        email: 'user@example.com',
        first_name: 'Alice',
        last_name: 'User',
        role: 'user',
        email_verified: true,
        company_id: companyIds[0] // TechCorp Inc
      },
      {
        email: 'admin2@example.com',
        first_name: 'Bob',
        last_name: 'Manager',
        role: 'admin',
        email_verified: true,
        company_id: companyIds[1] // StartupXYZ
      },
      {
        email: 'user2@example.com',
        first_name: 'Carol',
        last_name: 'Employee',
        role: 'user',
        email_verified: true,
        company_id: companyIds[1] // StartupXYZ
      }
    ];
    
    console.log('👥 Inserting users...');
    for (const user of users) {
      await pool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified, company_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [user.email, hashedPassword, user.first_name, user.last_name, user.role, user.email_verified, user.company_id]
      );
      console.log(`   ✅ Created user: ${user.email} (${user.role})`);
    }
    
    // Insert global settings
    console.log('⚙️ Inserting global settings...');
    const globalSettings = [
      {
        key: 'company_label',
        value: { value: 'Company' },
        description: 'Default label for companies/organizations'
      },
      {
        key: 'max_admins_per_company',
        value: { value: 5 },
        description: 'Maximum number of admin users per company'
      },
      {
        key: 'plan_features',
        value: {
          free: {
            max_users: 3,
            email_support: false,
            custom_branding: false,
            analytics: 'basic'
          },
          pro: {
            max_users: 100,
            email_support: true,
            custom_branding: true,
            analytics: 'advanced'
          },
          enterprise: {
            max_users: -1, // unlimited
            email_support: true,
            custom_branding: true,
            analytics: 'premium',
            dedicated_support: true
          }
        },
        description: 'Feature definitions for each subscription plan'
      }
    ];
    
    for (const setting of globalSettings) {
      await pool.query(
        `INSERT INTO global_settings (key, value, description) VALUES ($1, $2, $3)`,
        [setting.key, JSON.stringify(setting.value), setting.description]
      );
      console.log(`   ✅ Created setting: ${setting.key}`);
    }
    
    // Insert some test subscriptions
    console.log('💳 Inserting test subscriptions...');
    const subscriptions = [
      {
        company_id: companyIds[0],
        plan_type: 'pro',
        status: 'active',
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      },
      {
        company_id: companyIds[1],
        plan_type: 'pro',
        status: 'active',
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        company_id: companyIds[2],
        plan_type: 'enterprise',
        status: 'active',
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    ];
    
    for (const subscription of subscriptions) {
      await pool.query(
        `INSERT INTO subscriptions (company_id, plan_type, status, current_period_start, current_period_end) 
         VALUES ($1, $2, $3, $4, $5)`,
        [subscription.company_id, subscription.plan_type, subscription.status, subscription.current_period_start, subscription.current_period_end]
      );
      console.log(`   ✅ Created subscription for company`);
    }
    
    // Insert some test invoices
    console.log('🧾 Inserting test invoices...');
    const invoices = [
      {
        company_id: companyIds[0],
        amount: 2900, // $29.00
        currency: 'usd',
        status: 'paid',
        invoice_date: new Date(),
        paid_at: new Date()
      },
      {
        company_id: companyIds[1],
        amount: 2900,
        currency: 'usd',
        status: 'paid',
        invoice_date: new Date(),
        paid_at: new Date()
      },
      {
        company_id: companyIds[2],
        amount: 99900, // $999.00
        currency: 'usd',
        status: 'paid',
        invoice_date: new Date(),
        paid_at: new Date()
      }
    ];
    
    for (const invoice of invoices) {
      await pool.query(
        `INSERT INTO invoices (company_id, amount, currency, status, invoice_date, paid_at) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [invoice.company_id, invoice.amount, invoice.currency, invoice.status, invoice.invoice_date, invoice.paid_at]
      );
      console.log(`   ✅ Created invoice for $${(invoice.amount / 100).toFixed(2)}`);
    }
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('   Super Admin: super@example.com / password123');
    console.log('   Admin: admin@example.com / password123');
    console.log('   User: user@example.com / password123');
    console.log('   Admin 2: admin2@example.com / password123');
    console.log('   User 2: user2@example.com / password123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the seeding
seedDatabase(); 