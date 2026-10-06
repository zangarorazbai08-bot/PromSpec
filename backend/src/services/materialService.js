import pool from '../db/pool.js';

export const materialService = {
  async getMaterials(filters = {}) {
    const { search, color, category, min_quantity, max_quantity, in_stock } = filters;
    let query = `
      SELECT
        id, name, category, color,
        COALESCE(NULLIF(TRIM(unit), ''), 'дана') AS unit,
        min_quantity::numeric AS min_quantity,
        current_quantity::numeric AS current_quantity,
        COALESCE(unit_price, 0)::numeric AS unit_price,
        created_at, updated_at
      FROM materials
      WHERE 1=1
    `;
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
    return result.rows.map(row => ({
      ...row,
      current_quantity: parseFloat(row.current_quantity) || 0,
      min_quantity: parseFloat(row.min_quantity) || 0,
      unit_price: parseFloat(row.unit_price) || 0,
      // Прогресс деңгейі
      stock_level: row.min_quantity > 0
        ? Math.min(parseFloat(row.current_quantity) / parseFloat(row.min_quantity), 1)
        : 1,
      is_low_stock: parseFloat(row.current_quantity) <= parseFloat(row.min_quantity) && parseFloat(row.min_quantity) > 0,
    }));
  },

  async getMaterialById(id) {
    const result = await pool.query(`
      SELECT
        id, name, category, color,
        COALESCE(NULLIF(TRIM(unit), ''), 'дана') AS unit,
        min_quantity::numeric AS min_quantity,
        current_quantity::numeric AS current_quantity,
        COALESCE(unit_price, 0)::numeric AS unit_price,
        created_at, updated_at
      FROM materials WHERE id = $1
    `, [id]);
    if (result.rows.length === 0) {
      throw { status: 404, message: 'Материал табылмады' };
    }
    const row = result.rows[0];
    return {
      ...row,
      current_quantity: parseFloat(row.current_quantity) || 0,
      min_quantity: parseFloat(row.min_quantity) || 0,
      unit_price: parseFloat(row.unit_price) || 0,
    };
  },

  async createMaterial(data) {
    const { name, category, color, unit, min_quantity = 0, unit_price = 0 } = data;
    const result = await pool.query(
      `INSERT INTO materials (name, category, color, unit, min_quantity, current_quantity, unit_price)
       VALUES ($1, $2, $3, $4, $5, 0, $6)
       RETURNING *`,
      [name, category, color, unit || 'дана', min_quantity, unit_price]
    );
    return result.rows[0];
  },

  async updateMaterial(id, data) {
    const { name, category, color, unit, min_quantity, unit_price } = data;
    const result = await pool.query(
      `UPDATE materials
       SET name = COALESCE($1, name),
           category = COALESCE($2, category),
           color = COALESCE($3, color),
           unit = COALESCE($4, unit),
           min_quantity = COALESCE($5, min_quantity),
           unit_price = COALESCE($6, unit_price),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [name, category, color, unit, min_quantity, unit_price, id]
    );
    if (result.rows.length === 0) {
      throw { status: 404, message: 'Материал табылмады' };
    }
    return result.rows[0];
  },

  // Қойма жиынтық статистикасы
  async getSummary() {
    const result = await pool.query(`
      SELECT
        COUNT(*)::int AS total_positions,
        SUM(CASE WHEN current_quantity <= min_quantity AND min_quantity > 0 THEN 1 ELSE 0 END)::int AS low_stock_count,
        SUM(CASE WHEN current_quantity = 0 THEN 1 ELSE 0 END)::int AS empty_count,
        COALESCE(SUM(current_quantity::numeric * COALESCE(unit_price, 0)::numeric), 0) AS total_value
      FROM materials
    `);
    const row = result.rows[0];
    return {
      totalPositions: row.total_positions,
      lowStockCount: row.low_stock_count,
      emptyCount: row.empty_count,
      totalValue: parseFloat(row.total_value) || 0,
    };
  }
};
