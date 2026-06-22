import express from 'express';
import * as inventoryController from '../controllers/inventoryController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', inventoryController.getTransactions);

// Only admin, director, storekeeper can add direct inventory transactions
router.post('/', authorize('admin', 'director', 'storekeeper'), inventoryController.addTransaction);

export default router;
