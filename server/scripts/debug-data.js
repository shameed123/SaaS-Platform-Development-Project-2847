const { pool } = require('../database/connection');

async function debugData() {
  try {
    console.log('🔍 Debugging database data...\n');

    // Check users and their companies
    console.log('📋 Users and their companies:');
    const usersResult = await pool.query(`
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.role, u.company_id,
        c.name as company_name
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      ORDER BY u.role, u.email
    `);

    usersResult.rows.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) -> Company: ${user.company_name || 'No Company'} (ID: ${user.company_id || 'null'})`);
    });

    console.log('\n📊 Companies and their user counts:');
    const companiesResult = await pool.query(`
      SELECT 
        c.id, c.name,
        COUNT(u.id) as user_count
      FROM companies c
      LEFT JOIN users u ON c.id = u.company_id AND u.role != 'super_admin'
      GROUP BY c.id, c.name
      ORDER BY user_count DESC
    `);

    companiesResult.rows.forEach(company => {
      console.log(`  - ${company.name} -> ${company.user_count} users`);
    });

    console.log('\n✅ Debug complete');

  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await pool.end();
  }
}

debugData(); 