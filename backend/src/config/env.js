import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const asBoolean = (value, fallback = false) => {
  if (typeof value !== 'string') {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
  cookieName: process.env.COOKIE_NAME || 'staynest_token',
  jwtSecret: process.env.JWT_SECRET || 'replace-this-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  appName: process.env.APP_NAME || 'StayNest',
  emailFrom: process.env.EMAIL_FROM || 'StayNest <no-reply@staynest.local>',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  databaseUrl: process.env.DATABASE_URL || '',
  db: {
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT) || 5432,
    database: process.env.PGDATABASE || 'staynest_portal',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    ssl: asBoolean(process.env.DB_SSL)
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: asBoolean(process.env.SMTP_SECURE),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  },
  admin: {
    name: process.env.ADMIN_NAME || 'Admin',
    email: process.env.ADMIN_EMAIL || 'admin@promspec.local',
    password: process.env.ADMIN_PASSWORD || 'Admin12345'
  },
  director: {
    name: process.env.DIRECTOR_NAME || 'Бас Директор',
    email: process.env.DIRECTOR_EMAIL || 'director@promspec.local',
    password: process.env.DIRECTOR_PASSWORD || 'password123'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'replace-this-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cookieName: process.env.COOKIE_NAME || 'staynest_token'
  },
  isProduction: (process.env.NODE_ENV || 'development') === 'production'
};

export default env;
