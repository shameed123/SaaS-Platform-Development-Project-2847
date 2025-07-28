const { pool } = require('../database/connection');

async function testCompaniesAPI() {
  try {
    console.log('🔍 Testing Companies API...\n');

    // Test the exact query from the companies route
    const result = await pool.query(`
      SELECT 
        c.*,
        COUNT(u.id) as user_count
      FROM companies c
      LEFT JOIN users u ON c.id = u.company_id AND u.role != 'super_admin'
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);

    console.log('📊 Companies with user counts:');
    result.rows.forEach(company => {
      console.log(`  - ${company.name}: ${company.user_count} users`);
    });

    console.log('\n✅ Companies API test complete');

  } catch (error) {
    console.error('❌ Companies API test error:', error);
  } finally {
    await pool.end();
  }
}

testCompaniesAPI(); 