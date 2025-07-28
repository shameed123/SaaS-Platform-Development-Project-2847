const fs = require('fs');
const path = require('path');
const { pool } = require('../database/connection');

async function runMigration() {
  try {
    console.log('🚀 Starting database migration...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Parse SQL statements more robustly, handling dollar-quoted strings
    const statements = [];
    let currentStatement = '';
    let inDollarQuote = false;
    let dollarQuoteTag = '';
    
    const lines = schema.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines and full-line comments
      if (!trimmedLine || trimmedLine.startsWith('--')) {
        continue;
      }
      
      // Check for dollar-quoted strings
      if (!inDollarQuote) {
        // Look for opening dollar quote
        const dollarQuoteMatch = trimmedLine.match(/\$([^$]*)\$/);
        if (dollarQuoteMatch) {
          inDollarQuote = true;
          dollarQuoteTag = dollarQuoteMatch[1];
          currentStatement += line + '\n';
          continue;
        }
      } else {
        // Inside dollar quote - look for closing quote
        const closingQuoteMatch = trimmedLine.match(new RegExp(`\\$${dollarQuoteTag}\\$`));
        if (closingQuoteMatch) {
          inDollarQuote = false;
          dollarQuoteTag = '';
        }
        currentStatement += line + '\n';
        continue;
      }
      
      // Add line to current statement
      currentStatement += line + '\n';
      
      // If line ends with semicolon and we're not in a dollar quote, we have a complete statement
      if (trimmedLine.endsWith(';') && !inDollarQuote) {
        const cleanStatement = currentStatement.trim();
        if (cleanStatement && !cleanStatement.startsWith('--')) {
          statements.push(cleanStatement);
        }
        currentStatement = '';
      }
    }
    
    console.log(`📋 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        console.log(`\n🔧 Executing statement ${i + 1}/${statements.length}:`);
        console.log(`   ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`);
        
        await pool.query(statement);
        console.log(`✅ Successfully executed statement ${i + 1}/${statements.length}`);
      } catch (error) {
        // Skip if extension already exists or table already exists
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Skipped statement ${i + 1} (already exists)`);
        } else {
          console.error(`❌ Error in statement ${i + 1}/${statements.length}:`);
          console.error(`   Statement: ${statement}`);
          console.error(`   Error: ${error.message}`);
          throw error;
        }
      }
    }
    
    console.log('\n🎉 Database migration completed successfully!');
    
    // Test the connection and show table count
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`\n📊 Created ${result.rows.length} tables:`);
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Full error details:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migration
runMigration(); 