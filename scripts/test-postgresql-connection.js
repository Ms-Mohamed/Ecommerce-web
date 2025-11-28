const { Client } = require('pg');

async function testPostgreSQLConnection() {
  console.log('🔍 Testing PostgreSQL Connection...\n');

  // Common password combinations to try
  const passwords = ['postgres', 'password', 'admin', 'root', ''];
  
  for (const password of passwords) {
    console.log(`🔑 Trying password: "${password || '(empty)'}"`);
    
    const client = new Client({
      host: 'localhost',
      port: 5432,
      database: 'gocart_db',
      user: 'postgres',
      password: password,
    });

    try {
      await client.connect();
      console.log('✅ Connection successful!');
      console.log(`📊 Database: gocart_db`);
      console.log(`👤 User: postgres`);
      console.log(`🔑 Password: "${password || '(empty)'}"`);
      
      // Test a simple query
      const result = await client.query('SELECT version()');
      console.log(`🐘 PostgreSQL Version: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
      
      await client.end();
      
      console.log('\n🎉 Found working credentials!');
      console.log('\n📝 Add this to your .env file:');
      console.log(`DATABASE_URL="postgresql://postgres:${password}@localhost:5432/gocart_db"`);
      console.log(`DIRECT_URL="postgresql://postgres:${password}@localhost:5432/gocart_db"`);
      
      return password;
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
  }
  
  console.log('\n❌ Could not connect with any common passwords.');
  console.log('\n💡 Try these solutions:');
  console.log('   1. Check if PostgreSQL is running');
  console.log('   2. Check your PostgreSQL installation');
  console.log('   3. Look for password in pgAdmin or other tools');
  console.log('   4. Reset PostgreSQL password if needed');
  
  return null;
}

testPostgreSQLConnection();
