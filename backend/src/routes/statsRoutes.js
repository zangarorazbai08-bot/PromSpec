import express from 'express';
import pool from '../db/pool.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.use(protect);

// Dashboard stats
router.get('/stats', async (req, res, next) => {
  try {
    const [
      materials,
      activeRequests,
      pendingRequests,
      lowStock,
      totalValue,
      recentTx
    ] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS total FROM materials'),
      pool.query("SELECT COUNT(*)::int AS total FROM material_requests WHERE status NOT IN ('rejected','confirmed')"),
      pool.query("SELECT COUNT(*)::int AS total FROM material_requests WHERE status = 'pending'"),
      pool.query('SELECT COUNT(*)::int AS total FROM materials WHERE current_quantity <= min_quantity AND min_quantity > 0'),
      pool.query('SELECT COALESCE(SUM(current_quantity * COALESCE(unit_price, 0)), 0)::numeric AS total FROM materials'),
      pool.query(`
        SELECT t.type, t.quantity::numeric AS quantity, t.created_at,
               m.name AS material_name,
               COALESCE(m.unit, 'дана') AS unit,
               u.full_name AS user_name
        FROM inventory_transactions t
        JOIN materials m ON m.id = t.material_id
        JOIN users u ON u.id = t.user_id
        ORDER BY t.created_at DESC LIMIT 8
      `)
    ]);

    res.json({
      materialsCount: materials.rows[0].total,
      requestsCount: activeRequests.rows[0].total,
      pendingRequests: pendingRequests.rows[0].total,
      lowStockCount: lowStock.rows[0].total,
      totalWarehouseValue: parseFloat(totalValue.rows[0].total),
      recentTransactions: recentTx.rows
    });
  } catch (error) {
    next(error);
  }
});

// AI Chat endpoint — қоймадан ақпарат беру
router.post('/ai-chat', async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Сұрақ жіберіңіз' });

    const lowerMsg = message.toLowerCase();
    let reply = '';

    // Қоймада аз қалған материалдар
    if (lowerMsg.includes('аз') || lowerMsg.includes('төмен қор') || lowerMsg.includes('жетіспей')) {
      const r = await pool.query(`
        SELECT name, current_quantity::numeric, min_quantity::numeric,
               COALESCE(unit, 'дана') AS unit
        FROM materials
        WHERE current_quantity <= min_quantity AND min_quantity > 0
        ORDER BY (current_quantity::numeric / NULLIF(min_quantity::numeric, 0)) ASC
        LIMIT 5
      `);
      if (r.rows.length === 0) {
        reply = '✅ Қоймада төмен қорлы материалдар жоқ. Барлығы жеткілікті!';
      } else {
        reply = '⚠️ Төмен қорлы материалдар:\n' +
          r.rows.map(m => `• ${m.name}: ${parseFloat(m.current_quantity)} ${m.unit} (мин: ${parseFloat(m.min_quantity)} ${m.unit})`).join('\n');
      }
    }
    // Бүгінгі өтінімдер
    else if (lowerMsg.includes('өтінім') || lowerMsg.includes('бүгін') || lowerMsg.includes('заявка')) {
      const r = await pool.query(`
        SELECT COUNT(*)::int AS total,
               SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END)::int AS pending,
               SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END)::int AS approved
        FROM material_requests
        WHERE created_at >= CURRENT_DATE
      `);
      const d = r.rows[0];
      reply = `📋 Бүгінгі өтінімдер:\n• Барлығы: ${d.total}\n• Күтуде: ${d.pending}\n• Мақұлданды: ${d.approved}`;
    }
    // Қойма жалпы
    else if (lowerMsg.includes('қойма') || lowerMsg.includes('материал') || lowerMsg.includes('барлық')) {
      const r = await pool.query(`
        SELECT COUNT(*)::int AS total,
               SUM(CASE WHEN current_quantity > min_quantity THEN 1 ELSE 0 END)::int AS ok,
               SUM(CASE WHEN current_quantity <= min_quantity AND min_quantity > 0 THEN 1 ELSE 0 END)::int AS low
        FROM materials
      `);
      const d = r.rows[0];
      reply = `🏭 Қойма жағдайы:\n• Барлық позициялар: ${d.total}\n• Норма: ${d.ok}\n• Аз қалды: ${d.low}`;
    }
    // Арнайы материал іздеу
    else {
      const searchTerms = message.match(/[\u{0400}-\u{04FF}a-zA-Z]+/gu) || [];
      const searchStr = searchTerms.join(' ');
      const r = await pool.query(`
        SELECT name, current_quantity::numeric, COALESCE(unit, 'дана') AS unit
        FROM materials
        WHERE name ILIKE $1
        ORDER BY name
        LIMIT 3
      `, [`%${searchStr}%`]);

      if (r.rows.length > 0) {
        reply = `🔍 "${searchStr}" бойынша нәтижелер:\n` +
          r.rows.map(m => `• ${m.name}: ${parseFloat(m.current_quantity)} ${m.unit}`).join('\n');
      } else {
        reply = `Кешіріңіз, "${message}" туралы ақпарат таппадым. "аз қалды", "өтінімдер" немесе материал атауын жазыңыз.`;
      }
    }

    res.json({ reply });
  } catch (error) {
    next(error);
  }
});

// Smart Alerts — аз қорлы материалдар тізімі
router.get('/alerts', async (req, res, next) => {
  try {
    const r = await pool.query(`
      SELECT id, name, current_quantity::numeric, min_quantity::numeric,
             COALESCE(unit, 'дана') AS unit, category,
             CASE
               WHEN current_quantity = 0 THEN 'critical'
               WHEN current_quantity <= min_quantity * 0.5 THEN 'high'
               ELSE 'medium'
             END AS alert_level
      FROM materials
      WHERE current_quantity <= min_quantity AND min_quantity > 0
      ORDER BY (current_quantity::numeric / NULLIF(min_quantity::numeric, 0)) ASC
    `);
    res.json({ alerts: r.rows });
  } catch (error) {
    next(error);
  }
});

export default router;
