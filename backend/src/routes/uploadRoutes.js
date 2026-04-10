import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { propertyImageUpload } from '../middlewares/uploadMiddleware.js';
import * as uploadController from '../controllers/uploadController.js';

const router = Router();

router.post(
  '/properties',
  requireAuth,
  propertyImageUpload.array('images'),
  asyncHandler(uploadController.uploadPropertyImages)
);

export default router;
