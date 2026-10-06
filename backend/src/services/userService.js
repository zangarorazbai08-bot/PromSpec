import pool from '../db/pool.js';
import { hashPassword, comparePassword } from '../utils/password.js';

export const userService = {
  async getUsers() {
    const result = await pool.query(
      'SELECT id, full_name, email, phone, role, is_approved, created_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  },

  async approveUser(id) {
    const result = await pool.query(
      'UPDATE users SET is_approved = true, updated_at = NOW() WHERE id = $1 RETURNING id, full_name, email, role, is_approved',
      [id]
    );
    if (result.rows.length === 0) {
      throw { status: 404, message: 'Пайдаланушы табылмады' };
    }
    return result.rows[0];
  },

  async updateProfile(id, { full_name, email, phone }) {
    // Check if email is already used by someone else
    if (email) {
      const existing = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email.toLowerCase(), id]);
      if (existing.rows.length) {
        throw { status: 400, message: 'Бұл email басқа аккаунтқа тіркеліп қойған' };
      }
    }

    const result = await pool.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name), 
           email = COALESCE($2, email), 
           phone = COALESCE($3, phone),
           updated_at = NOW() 
       WHERE id = $4 
       RETURNING id, full_name, email, phone, role, is_approved`,
      [full_name, email?.toLowerCase(), phone, id]
    );

    if (result.rows.length === 0) {
      throw { status: 404, message: 'Пайдаланушы табылмады' };
    }
    return result.rows[0];
  },

  async updatePassword(id, oldPassword, newPassword) {
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [id]);
    const user = result.rows[0];
    if (!user) throw { status: 404, message: 'Пайдаланушы табылмады' };

    if (!(await comparePassword(oldPassword, user.password_hash))) {
      throw { status: 401, message: 'Қазіргі құпиясөз қате' };
    }

    const hashed = await hashPassword(newPassword);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hashed, id]);
    return { success: true };
  }
};
