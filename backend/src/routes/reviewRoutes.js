import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import * as reviewController from '../controllers/reviewController.js';

const router = Router();

router.get('/property/:propertyId', asyncHandler(reviewController.listPropertyReviews));
router.post('/property/:propertyId', requireAuth, asyncHandler(reviewController.upsertReview));

export default router;
