const { pool } = require('../database/connection');

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const result = await pool.query('SELECT version()');
    console.log('✅ Database connection successful');
    console.log(`📊 PostgreSQL version: ${result.rows[0].version}`);
    
    // Check if database exists
    const dbResult = await pool.query(`
      SELECT datname 
      FROM pg_database 
      WHERE datname = current_database()
    `);
    console.log(`📁 Current database: ${dbResult.rows[0].datname}`);
    
    // Check existing tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`📋 Existing tables (${tablesResult.rows.length}):`);
    if (tablesResult.rows.length === 0) {
      console.log('   No tables found');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

testConnection(); 