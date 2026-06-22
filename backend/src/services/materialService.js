import pool from '../db/pool.js';

export const materialService = {
  async getMaterials(filters = {}) {
    const { search, color, category, min_quantity, max_quantity, in_stock } = filters;
    let query = 'SELECT * FROM materials WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR category ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (color) {
      query += ` AND color ILIKE $${paramIndex}`;
      params.push(`%${color}%`);
      paramIndex++;
    }

    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (min_quantity !== undefined) {
      query += ` AND current_quantity >= $${paramIndex}`;
      params.push(min_quantity);
      paramIndex++;
    }

    if (max_quantity !== undefined) {
      query += ` AND current_quantity <= $${paramIndex}`;
      params.push(max_quantity);
      paramIndex++;
    }

    if (in_stock === 'true') {
      query += ' AND current_quantity > 0';
    }

    query += ' ORDER BY name ASC';

    const result = await pool.query(query, params);
    return result.rows;
  },

  async getMaterialById(id) {
    const result = await pool.query('SELECT * FROM materials WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw { status: 404, message: 'Материал табылмады' };
    }
    return result.rows[0];
  },

  async createMaterial(data) {
    const { name, category, color, unit, min_quantity = 0 } = data;
    const result = await pool.query(
      `
        INSERT INTO materials (name, category, color, unit, min_quantity, current_quantity)
        VALUES ($1, $2, $3, $4, $5, 0)
        RETURNING *
      `,
      [name, category, color, unit, min_quantity]
    );
    return result.rows[0];
  },

  async updateMaterial(id, data) {
    const { name, category, color, unit, min_quantity } = data;
    const result = await pool.query(
      `
        UPDATE materials
        SET name = COALESCE($1, name),
            category = COALESCE($2, category),
            color = COALESCE($3, color),
            unit = COALESCE($4, unit),
            min_quantity = COALESCE($5, min_quantity),
            updated_at = NOW()
        WHERE id = $6
        RETURNING *
      `,
      [name, category, color, unit, min_quantity, id]
    );
    if (result.rows.length === 0) {
      throw { status: 404, message: 'Материал табылмады' };
    }
    return result.rows[0];
  }
};
