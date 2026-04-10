import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import * as favoriteController from '../controllers/favoriteController.js';

const router = Router();

router.get('/', requireAuth, asyncHandler(favoriteController.listFavorites));
router.post('/:propertyId', requireAuth, asyncHandler(favoriteController.addFavorite));
router.delete('/:propertyId', requireAuth, asyncHandler(favoriteController.removeFavorite));

export default router;
