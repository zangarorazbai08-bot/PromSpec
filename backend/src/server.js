import app from './app.js';
import { initializeDatabase } from './db/init.js';
import env from './config/env.js';

try {
  await initializeDatabase();
  app.listen(env.port, '0.0.0.0', () => {
    console.log(`Backend running on http://0.0.0.0:${env.port}`);
    console.log(`Local access: http://localhost:${env.port}`);
    console.log(`Network access: http://192.168.0.232:${env.port}`);
  });
} catch (error) {
  console.error('Failed to start backend:', error);
  process.exit(1);
}
