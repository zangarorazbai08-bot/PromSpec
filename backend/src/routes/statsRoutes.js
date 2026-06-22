import express from 'express';
import pool from '../db/pool.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/stats', async (req, res, next) => {
  try {
    const [materials, pendingRequests, projects, pendingUsers, lowStock, recentTx] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS total, COALESCE(SUM(current_quantity),0)::numeric AS total_qty FROM materials'),
      pool.query("SELECT COUNT(*)::int AS total FROM material_requests WHERE status='pending'"),
      pool.query("SELECT COUNT(*)::int AS total FROM projects WHERE status='active'"),
      pool.query("SELECT COUNT(*)::int AS total FROM users WHERE is_approved=false AND role NOT IN ('admin','director')"),
      pool.query('SELECT COUNT(*)::int AS total FROM materials WHERE current_quantity <= min_quantity AND min_quantity > 0'),
      pool.query(`
        SELECT t.type, t.quantity, t.created_at, m.name as material_name, m.unit, u.full_name as user_name
        FROM inventory_transactions t
        JOIN materials m ON m.id = t.material_id
        JOIN users u ON u.id = t.user_id
        ORDER BY t.created_at DESC LIMIT 8
      `)
    ]);

    res.json({
      materialsCount: materials.rows[0].total,
      totalQty: parseFloat(materials.rows[0].total_qty),
      pendingRequests: pendingRequests.rows[0].total,
      activeProjects: projects.rows[0].total,
      pendingUsers: pendingUsers.rows[0].total,
      lowStockCount: lowStock.rows[0].total,
      recentTransactions: recentTx.rows
    });
  } catch (error) {
    next(error);
  }
});

export default router;
