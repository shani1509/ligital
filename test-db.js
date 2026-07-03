const { Client } = require('pg');

async function test() {
  const passwords = ['amine', 'Amine', 'postgres', 'root', 'password', 'admin', '1234', 'postgres123', ''];
  console.log('Testing passwords...');
  
  for (const p of passwords) {
    const client = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'postgres',
      password: p,
      port: 5432
    });
    
    try {
      await client.connect();
      console.log('SUCCESS: The password is -> "' + p + '"');
      await client.end();
      return;
    } catch (e) {
      // Ignore auth failure
    }
  }
  console.log('FAILED: None of the passwords worked.');
}

test();
