import pool from '../db/pool.js';
import { hashPassword, comparePassword } from '../utils/password.js';

export const authService = {
  async register(data) {
    const { full_name, email, password, phone, role = 'storekeeper' } = data;
    
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) {
      throw { status: 400, message: 'Бұл email тіркеліп қойған' };
    }

    const hashed = await hashPassword(password);
    // Admins, directors, and clients are approved automatically,
    // but storekeepers and foremen are false and require admin approval.
    const isApproved = (role === 'admin' || role === 'director' || role === 'client') ? true : false;

    const result = await pool.query(
      `
        INSERT INTO users (full_name, email, password_hash, phone, role, is_approved)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, full_name, email, role, is_approved
      `,
      [full_name, email, hashed, phone, role, isApproved]
    );

    return result.rows[0];
  },

  async login(email, password) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = result.rows[0];

    if (!user || !(await comparePassword(password, user.password_hash))) {
      throw { status: 401, message: 'Email немесе құпиясөз қате' };
    }

    if (!user.is_approved) {
      throw { status: 403, message: 'Аккаунтыңызды бастық әлі растамады. Күте тұрыңыз.' };
    }

    return {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      is_approved: user.is_approved
    };
  },

  async getMe(id) {
    const result = await pool.query(
      'SELECT id, full_name, email, phone, role, is_approved FROM users WHERE id = $1',
      [id]
    );
    if (!result.rows[0]) throw { status: 404, message: 'Пайдаланушы табылмады' };
    return result.rows[0];
  },

  async oauthMock(provider) {
    const email = `mock_${provider}@example.com`;
    const fullName = `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`;
    
    try {
      // Check if user already exists
      let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      let user = result.rows[0];
      
      if (!user) {
        // Create new user instantly, auto-approved
        const hashed = await hashPassword('OAuth_Pass_' + provider + '_123!');
        const insertRes = await pool.query(
          `INSERT INTO users (full_name, email, password_hash, phone, role, is_approved)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
          [fullName, email, hashed, '', 'client', true]
        );
        user = insertRes.rows[0];
      } else if (!user.is_approved) {
        // Make sure OAuth users are always approved
        await pool.query('UPDATE users SET is_approved = true WHERE id = $1', [user.id]);
        user.is_approved = true;
      }
      
      return {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        is_approved: true,
        phone: user.phone || ''
      };
    } catch (err) {
      console.error('oauthMock error:', err);
      throw { status: 500, message: 'OAuth кіру қатесі: ' + (err.message || 'Unknown error') };
    }
  }
};
