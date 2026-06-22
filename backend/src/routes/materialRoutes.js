import express from 'express';
import * as materialController from '../controllers/materialController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // All material routes require auth

router.get('/', materialController.getMaterials);
router.get('/:id', materialController.getMaterialById);

// Only admin, director, storekeeper can create/edit materials
router.post('/', authorize('admin', 'director', 'storekeeper'), materialController.createMaterial);
router.put('/:id', authorize('admin', 'director', 'storekeeper'), materialController.updateMaterial);

export default router;
