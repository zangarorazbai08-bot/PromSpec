import pool from '../db/pool.js';

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
  }
};
