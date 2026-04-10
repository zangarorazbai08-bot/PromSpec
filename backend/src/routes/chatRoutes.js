import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import * as chatController from '../controllers/chatController.js';

const router = Router();

router.use(requireAuth);
router.get('/conversations', asyncHandler(chatController.listConversations));
router.get('/bookings/:bookingId', asyncHandler(chatController.listMessages));
router.post('/bookings/:bookingId', asyncHandler(chatController.sendMessage));

export default router;
