import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import * as propertyController from '../controllers/propertyController.js';

const router = Router();

router.get('/', asyncHandler(propertyController.listProperties));
router.get('/mine', requireAuth, asyncHandler(propertyController.listMyProperties));
router.get('/:id', asyncHandler(propertyController.getPropertyById));
router.post('/', requireAuth, asyncHandler(propertyController.createProperty));
router.patch('/:id', requireAuth, asyncHandler(propertyController.updateProperty));
router.delete('/:id', requireAuth, asyncHandler(propertyController.deleteProperty));

export default router;
