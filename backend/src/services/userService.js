import pool from '../db/pool.js';
import { createError } from '../utils/httpError.js';
import { cleanString, isEmail } from '../utils/validators.js';

const mapUser = (row) => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  phone: row.phone,
  avatarUrl: row.avatar_url,
  role: row.role,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export const getProfile = async (userId) => {
  const result = await pool.query(
    `
      SELECT id, full_name, email, phone, avatar_url, role, created_at, updated_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [userId]
  );

  if (!result.rows.length) {
    throw createError(404, 'Қолданушы табылмады');
  }

  return mapUser(result.rows[0]);
};

export const updateProfile = async (userId, payload) => {
  const fullName = cleanString(payload.fullName);
  const email = cleanString(payload.email).toLowerCase();
  const phone = cleanString(payload.phone);
  const avatarUrl = cleanString(payload.avatarUrl);

  if (!fullName) {
    throw createError(400, 'Аты-жөніңізді енгізіңіз');
  }

  if (!isEmail(email)) {
    throw createError(400, 'Email форматы қате');
  }

  const existing = await pool.query('SELECT id FROM users WHERE email = $1 AND id <> $2 LIMIT 1', [email, userId]);

  if (existing.rows.length) {
    throw createError(409, 'Бұл email басқа аккаунтта қолданылып тұр');
  }

  const result = await pool.query(
    `
      UPDATE users
      SET full_name = $1, email = $2, phone = $3, avatar_url = $4, updated_at = NOW()
      WHERE id = $5
      RETURNING id, full_name, email, phone, avatar_url, role, created_at, updated_at
    `,
    [fullName, email, phone || null, avatarUrl || null, userId]
  );

  if (!result.rows.length) {
    throw createError(404, 'Қолданушы табылмады');
  }

  return mapUser(result.rows[0]);
};

export const listUsers = async () => {
  const result = await pool.query(
    `
      SELECT id, full_name, email, phone, avatar_url, role, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `
  );

  return result.rows.map(mapUser);
};
