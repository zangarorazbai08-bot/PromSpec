import jwt from 'jsonwebtoken';
import pool from '../db/pool.js';
import env from '../config/env.js';

const COOKIE_NAME = env.jwt?.cookieName || env.cookieName || 'staynest_token';
const JWT_SECRET = env.jwt?.secret || env.jwtSecret || 'replace-this-secret';

export const protect = async (req, res, next) => {
  let token;

  // Try cookie first, then Authorization header
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    token = req.cookies[COOKIE_NAME];
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token || token === 'none') {
    return res.status(401).json({ message: 'Авторизация қажет' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const result = await pool.query(
      'SELECT id, full_name, email, role, is_approved FROM users WHERE id = $1',
      [decoded.id]
    );

    if (!result.rows.length) {
      return res.status(401).json({ message: 'Қолданушы табылмады' });
    }

    const user = result.rows[0];

    if (!user.is_approved) {
      return res.status(403).json({ message: 'Аккаунтыңызды бастық әлі растамады.' });
    }

    req.user = {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Сессия жарамсыз' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Бұл әрекетке құқығыңыз жоқ' });
    }
    next();
  };
};
