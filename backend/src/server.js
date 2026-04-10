import app from './app.js';
import { initializeDatabase } from './db/init.js';
import env from './config/env.js';
import { ensureUploadDirectories } from './services/uploadService.js';

try {
  await ensureUploadDirectories();
  await initializeDatabase();
  app.listen(env.port, () => {
    console.log(`Backend running on http://localhost:${env.port}`);
  });
} catch (error) {
  console.error('Failed to start backend:', error);
  process.exit(1);
}
