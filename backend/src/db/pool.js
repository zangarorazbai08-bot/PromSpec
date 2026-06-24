import { Pool } from 'pg';
import env from '../config/env.js';

const config = env.databaseUrl
  ? {
      connectionString: env.databaseUrl,
      ssl: env.isProduction || env.db.ssl || env.databaseUrl.includes('neon.tech') || env.databaseUrl.includes('render.com')
        ? { rejectUnauthorized: false }
        : false
    }
  : {
      host: env.db.host,
      port: env.db.port,
      database: env.db.database,
      user: env.db.user,
      password: env.db.password,
      ssl: env.isProduction || env.db.ssl
        ? { rejectUnauthorized: false }
        : false
    };

const pool = new Pool(config);

pool.on('error', (error) => {
  console.error('PostgreSQL pool error:', error);
});

export default pool;
