import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import * as assistantController from '../controllers/assistantController.js';

const router = Router();

router.post('/chat', asyncHandler(assistantController.chat));

export default router;
