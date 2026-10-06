import express from 'express';
import * as materialController from '../controllers/materialController.js';
import { materialService } from '../services/materialService.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.use(protect);

// Қойма жиынтық статистикасы
router.get('/summary', async (req, res, next) => {
  try {
    const summary = await materialService.getSummary();
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

router.get('/', materialController.getMaterials);
router.get('/:id', materialController.getMaterialById);

router.post('/', authorize('admin', 'director', 'storekeeper'), materialController.createMaterial);
router.put('/:id', authorize('admin', 'director', 'storekeeper'), materialController.updateMaterial);

export default router;
