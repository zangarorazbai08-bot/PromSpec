import express from 'express';
import * as projectController from '../controllers/projectController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', projectController.getProjects);
router.post('/', authorize('admin', 'director'), projectController.createProject);

export default router;
