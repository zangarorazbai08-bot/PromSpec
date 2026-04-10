import pool from '../db/pool.js';
import env from '../config/env.js';
import asyncHandler from '../utils/asyncHandler.js';
import { verifyToken } from '../utils/token.js';
import { createError } from '../utils/httpError.js';

export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[env.cookieName];

  if (!token) {
    throw createError(401, 'Авторизация қажет');
  }

  let payload;

  try {
    payload = verifyToken(token);
  } catch (error) {
    throw createError(401, 'Сессия жарамсыз');
  }

  const result = await pool.query(
    `
      SELECT id, full_name, email, phone, avatar_url, role, created_at, updated_at
      FROM users
      WHERE id = $1 AND is_active = true
      LIMIT 1
    `,
    [payload.sub]
  );

  if (!result.rows.length) {
    throw createError(401, 'Қолданушы табылмады');
  }

  req.user = {
    id: result.rows[0].id,
    fullName: result.rows[0].full_name,
    email: result.rows[0].email,
    phone: result.rows[0].phone,
    avatarUrl: result.rows[0].avatar_url,
    role: result.rows[0].role,
    createdAt: result.rows[0].created_at,
    updatedAt: result.rows[0].updated_at
  };

  next();
});

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    next(createError(403, 'Рұқсат жеткіліксіз'));
    return;
  }

  next();
};
