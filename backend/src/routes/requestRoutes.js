import express from 'express';
import * as c from '../controllers/requestController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import pool from '../db/pool.js';

const router = express.Router();
router.use(protect);

// Мобилка үшін оңайлатылған өтінімдер тізімі (flat format)
router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    const userId = req.user.id;
    const role = req.user.role;

    let query = `
      SELECT
        r.id,
        r.status,
        r.request_type,
        r.notes AS title,
        r.created_at,
        r.updated_at,
        p.name AS project_name,
        f.full_name AS foreman_name,
        COALESCE(r.notes, 'Өтінім #' || r.id) AS display_title,
        -- Бірінші item негізінде material/quantity алу
        (SELECT m.name FROM material_request_items i JOIN materials m ON m.id = i.material_id WHERE i.request_id = r.id LIMIT 1) AS material,
        (SELECT CONCAT(i.quantity::numeric, ' ', COALESCE(NULLIF(TRIM(m.unit),''), 'дана'))
         FROM material_request_items i JOIN materials m ON m.id = i.material_id WHERE i.request_id = r.id LIMIT 1) AS quantity,
        (SELECT COUNT(*)::int FROM material_request_items WHERE request_id = r.id) AS items_count,
        -- Басымдық: items санына және статусына қарай
        CASE
          WHEN r.status = 'pending' AND r.created_at > NOW() - INTERVAL '1 day' THEN 'high'
          WHEN r.status = 'pending' THEN 'normal'
          ELSE 'low'
        END AS priority,
        TO_CHAR(r.created_at, 'DD Mon YYYY') AS date
      FROM material_requests r
      JOIN projects p ON r.project_id = p.id
      JOIN users f ON r.foreman_id = f.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    // Foreman тек өзінің өтінімдерін көреді
    if (role === 'foreman') {
      query += ` AND r.foreman_id = $${idx++}`;
      params.push(userId);
    }

    if (status && status !== 'all') {
      query += ` AND r.status = $${idx++}`;
      params.push(status);
    }

    query += ' ORDER BY r.created_at DESC LIMIT 50';

    const result = await pool.query(query, params);
    res.json({ requests: result.rows });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', c.getRequestById);

// Мобилкадан жаңа өтінім жасау (оңайлатылған)
router.post('/simple', async (req, res, next) => {
  try {
    const { title, material_name, quantity, priority, notes } = req.body;
    const userId = req.user.id;

    // Бірінші белсенді жобаны алу
    const projectRes = await pool.query("SELECT id FROM projects WHERE status='active' ORDER BY id LIMIT 1");
    if (!projectRes.rows.length) {
      return res.status(400).json({ message: 'Белсенді жоба жоқ' });
    }
    const projectId = projectRes.rows[0].id;

    // Материалды іздеу немесе жасау
    let materialRes = await pool.query('SELECT id FROM materials WHERE name ILIKE $1 LIMIT 1', [`%${material_name}%`]);
    let materialId;
    if (materialRes.rows.length > 0) {
      materialId = materialRes.rows[0].id;
    } else {
      // Жаңа материал жасау (уақытша)
      const newMat = await pool.query(
        "INSERT INTO materials (name, unit, min_quantity, current_quantity) VALUES ($1, 'дана', 0, 0) RETURNING id",
        [material_name]
      );
      materialId = newMat.rows[0].id;
    }

    // Өтінім жасау
    const reqRes = await pool.query(`
      INSERT INTO material_requests (foreman_id, project_id, notes, status, request_type)
      VALUES ($1, $2, $3, 'pending', 'purchase')
      RETURNING id
    `, [userId, projectId, title || notes || `${material_name} өтінімі`]);

    const requestId = reqRes.rows[0].id;

    await pool.query(`
      INSERT INTO material_request_items (request_id, material_id, quantity)
      VALUES ($1, $2, $3)
    `, [requestId, materialId, parseFloat(quantity) || 1]);

    res.status(201).json({
      request: {
        id: requestId,
        status: 'pending',
        title: title || `${material_name} өтінімі`,
        material: material_name,
        quantity,
        priority: priority || 'normal',
        date: new Date().toLocaleDateString('kk-KZ')
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', authorize('foreman', 'admin'), c.createRequest);
router.patch('/:id/status', authorize('supplier', 'storekeeper', 'admin', 'director'), c.updateStatus);
router.post('/:id/issue', authorize('storekeeper', 'admin'), c.issueRequest);
router.post('/:id/confirm', authorize('foreman'), c.confirmReceipt);

export default router;
