import express from 'express';
import * as userController from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.use(protect);

// Only ADMIN can see all users and approve them
router.get('/', authorize('admin', 'director'), userController.getUsers);
router.patch('/:id/approve', authorize('admin'), userController.approveUser);

export default router;
