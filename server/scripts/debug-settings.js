const { pool } = require('../database/connection');

async function debugSettings() {
  try {
    console.log('🔍 Debugging global settings...\n');

    const result = await pool.query('SELECT key, value FROM global_settings');
    
    console.log('📋 Global settings in database:');
    result.rows.forEach(row => {
      console.log(`  - ${row.key}: ${typeof row.value} = ${row.value}`);
    });

    console.log('\n✅ Settings debug complete');

  } catch (error) {
    console.error('❌ Settings debug error:', error);
  } finally {
    await pool.end();
  }
}

debugSettings(); 