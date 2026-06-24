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
  },

  async addScannedProduct(data, userId) {
    const { name, category, color, unit, quantity, notes } = data;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // 1. Search for existing material (case-insensitive)
      const findRes = await client.query(
        'SELECT * FROM materials WHERE LOWER(name) = LOWER($1)',
        [name.trim()]
      );
      
      let materialId;
      if (findRes.rows.length > 0) {
        materialId = findRes.rows[0].id;
      } else {
        // Create new material
        const createRes = await client.query(
          `
            INSERT INTO materials (name, category, color, unit, current_quantity, min_quantity)
            VALUES ($1, $2, $3, $4, 0, 10)
            RETURNING id
          `,
          [name.trim(), category, color, unit]
        );
        materialId = createRes.rows[0].id;
      }
      
      // 2. Add inventory transaction
      const transRes = await client.query(
        `
          INSERT INTO inventory_transactions 
          (material_id, user_id, type, quantity, reference_type, notes)
          VALUES ($1, $2, 'in', $3, 'scan', $4)
          RETURNING *
        `,
        [materialId, userId, quantity, notes || 'Сканерлеу арқылы қабылданды']
      );
      
      // 3. Update material quantity
      await client.query(
        `
          UPDATE materials
          SET current_quantity = current_quantity + $1,
              updated_at = NOW()
          WHERE id = $2
        `,
        [quantity, materialId]
      );
      
      await client.query('COMMIT');
      return transRes.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
};
