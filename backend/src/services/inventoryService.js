import pool from '../db/pool.js';

export const inventoryService = {
  async getTransactions(filters = {}) {
    const { material_id, user_id, type } = filters;
    let query = `
      SELECT t.*, m.name as material_name, m.unit, u.full_name as user_name
      FROM inventory_transactions t
      JOIN materials m ON t.material_id = m.id
      JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (material_id) {
      query += ` AND t.material_id = $${paramIndex}`;
      params.push(material_id);
      paramIndex++;
    }

    if (user_id) {
      query += ` AND t.user_id = $${paramIndex}`;
      params.push(user_id);
      paramIndex++;
    }

    if (type) {
      query += ` AND t.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    query += ' ORDER BY t.created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  },

  async addTransaction(data, userId) {
    const { material_id, type, quantity, reference_type, reference_id, notes } = data;
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const res = await client.query(
        `
          INSERT INTO inventory_transactions 
          (material_id, user_id, type, quantity, reference_type, reference_id, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `,
        [material_id, userId, type, quantity, reference_type, reference_id, notes]
      );

      // Update material current_quantity
      const modifier = type === 'in' ? '+' : '-';
      await client.query(
        `
          UPDATE materials
          SET current_quantity = current_quantity ${modifier} $1,
              updated_at = NOW()
          WHERE id = $2
        `,
        [quantity, material_id]
      );

      await client.query('COMMIT');
      return res.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
};
