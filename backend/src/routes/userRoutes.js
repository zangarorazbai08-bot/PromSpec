import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import * as userController from '../controllers/userController.js';

const router = Router();

router.get('/profile', requireAuth, asyncHandler(userController.getProfile));
router.patch('/profile', requireAuth, asyncHandler(userController.updateProfile));

export default router;
