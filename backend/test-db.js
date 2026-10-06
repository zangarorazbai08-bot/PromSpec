import pg from 'pg';

const passwords = ['postgres', 'root', '', '1234', '12345', 'admin'];
const user = 'postgres';
const host = 'localhost';
const port = 5432;
const targetDb = 'staynest_portal';

async function tryConnect() {
  for (const pw of passwords) {
    console.log(`Trying password: "${pw}"`);
    const pool = new pg.Pool({
      host,
      port,
      user,
      password: pw,
      database: 'postgres' // connect to default db first
    });

    try {
      const client = await pool.connect();
      console.log(`Success! Password is: "${pw}"`);
      
      // Check if target database exists
      const res = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [targetDb]);
      if (res.rows.length === 0) {
        console.log(`Database "${targetDb}" does not exist. Creating...`);
        await client.query(`CREATE DATABASE ${targetDb}`);
        console.log(`Database "${targetDb}" created successfully.`);
      } else {
        console.log(`Database "${targetDb}" already exists.`);
      }
      
      client.release();
      await pool.end();
      return { success: true, password: pw };
    } catch (e) {
      console.log(`Failed with password: "${pw}" - Error: ${e.message}`);
      await pool.end();
    }
  }
  console.log("None of the passwords worked.");
  return { success: false };
}

tryConnect();
