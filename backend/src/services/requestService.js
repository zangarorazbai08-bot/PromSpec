import pool from '../db/pool.js';

const BASE_SELECT = `
  SELECT 
    r.*,
    p.name AS project_name, p.location AS project_location,
    f.full_name AS foreman_name, f.email AS foreman_email, f.phone AS foreman_phone,
    s.full_name AS supplier_name,
    sk.full_name AS storekeeper_name
  FROM material_requests r
  JOIN projects p ON r.project_id = p.id
  JOIN users f ON r.foreman_id = f.id
  LEFT JOIN users s ON r.supplier_id = s.id
  LEFT JOIN users sk ON r.storekeeper_id = sk.id
`;

const getItems = async (requestId) => {
  const res = await pool.query(`
    SELECT i.*, m.name AS material_name, m.unit, m.color, m.category
    FROM material_request_items i
    JOIN materials m ON i.material_id = m.id
    WHERE i.request_id = $1
    ORDER BY m.name
  `, [requestId]);
  return res.rows;
};

export const requestService = {
  async getRequests(filters = {}) {
    const { request_type, status, foreman_id, project_id } = filters;
    let query = BASE_SELECT + ' WHERE 1=1';
    const params = [];
    let idx = 1;

    if (request_type) { query += ` AND r.request_type = $${idx++}`; params.push(request_type); }
    if (status) { query += ` AND r.status = $${idx++}`; params.push(status); }
    if (foreman_id) { query += ` AND r.foreman_id = $${idx++}`; params.push(foreman_id); }
    if (project_id) { query += ` AND r.project_id = $${idx++}`; params.push(project_id); }

    query += ' ORDER BY r.created_at DESC';
    const result = await pool.query(query, params);
    const requests = result.rows;
    for (const req of requests) {
      req.items = await getItems(req.id);
    }
    return requests;
  },

  async getById(id) {
    const result = await pool.query(BASE_SELECT + ' WHERE r.id = $1', [id]);
    if (!result.rows.length) throw { status: 404, message: 'Заявка табылмады' };
    const req = result.rows[0];
    req.items = await getItems(req.id);
    return req;
  },

  async createRequest(data, foremanId) {
    const { project_id, notes, items, request_type = 'purchase' } = data;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Validate items
      if (!items || items.length === 0) throw { status: 400, message: 'Материалдар тізімі бос' };

      // For issuance: check stock
      if (request_type === 'issuance') {
        for (const item of items) {
          const m = await client.query('SELECT current_quantity, name, unit FROM materials WHERE id = $1', [item.material_id]);
          if (!m.rows.length) throw { status: 400, message: 'Материал табылмады' };
          if (parseFloat(m.rows[0].current_quantity) < parseFloat(item.quantity)) {
            throw { status: 400, message: `"${m.rows[0].name}" — қоймада жеткіліксіз (бар: ${m.rows[0].current_quantity} ${m.rows[0].unit})` };
          }
        }
      }

      const reqRes = await client.query(`
        INSERT INTO material_requests (foreman_id, project_id, notes, status, request_type)
        VALUES ($1, $2, $3, 'pending', $4)
        RETURNING *
      `, [foremanId, project_id, notes, request_type]);

      const requestId = reqRes.rows[0].id;

      for (const item of items) {
        await client.query(`
          INSERT INTO material_request_items (request_id, material_id, quantity)
          VALUES ($1, $2, $3)
        `, [requestId, item.material_id, item.quantity]);
      }

      await client.query('COMMIT');
      const created = await requestService.getById(requestId);
      return created;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // Storekeeper issues materials → stock decreases → foreman must confirm
  async issueRequest(id, storekeeperId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const req = await requestService.getById(id);
      if (req.status !== 'approved' && req.status !== 'pending') {
        throw { status: 400, message: 'Бұл заявканы беру мүмкін емес (статус: ' + req.status + ')' };
      }

      // Deduct from stock
      for (const item of req.items) {
        const mat = await client.query('SELECT current_quantity FROM materials WHERE id = $1', [item.material_id]);
        if (parseFloat(mat.rows[0].current_quantity) < parseFloat(item.quantity)) {
          throw { status: 400, message: `"${item.material_name}" — қоймада жетіспейді` };
        }

        await client.query(`
          UPDATE materials SET current_quantity = current_quantity - $1, updated_at = NOW() WHERE id = $2
        `, [item.quantity, item.material_id]);

        await client.query(`
          INSERT INTO inventory_transactions (material_id, user_id, type, quantity, reference_type, reference_id, notes)
          VALUES ($1, $2, 'out', $3, 'issuance', $4, $5)
        `, [item.material_id, storekeeperId, item.quantity, id, `Заявка ${req.request_number} бойынша берілді`]);
      }

      await client.query(`
        UPDATE material_requests 
        SET status = 'issued', storekeeper_id = $1, issued_at = NOW(), updated_at = NOW()
        WHERE id = $2
      `, [storekeeperId, id]);

      await client.query('COMMIT');
      return await requestService.getById(id);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // Foreman confirms receipt
  async confirmReceipt(id, foremanId) {
    const req = await requestService.getById(id);
    if (req.foreman_id !== foremanId) throw { status: 403, message: 'Бұл сіздің заявкаңыз емес' };
    if (req.status !== 'issued') throw { status: 400, message: 'Заявка әлі берілмеген' };

    await pool.query(`
      UPDATE material_requests
      SET status = 'confirmed', foreman_confirmed = true, foreman_confirmed_at = NOW(), updated_at = NOW()
      WHERE id = $1
    `, [id]);

    return await requestService.getById(id);
  },

  async updateStatus(id, status, userId) {
    await pool.query(`
      UPDATE material_requests SET status = $1, updated_at = NOW() WHERE id = $2
    `, [status, id]);
    return await requestService.getById(id);
  }
};
