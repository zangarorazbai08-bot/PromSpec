import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';
import * as adminController from '../controllers/adminController.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));
router.get('/summary', asyncHandler(adminController.getSummary));
router.get('/users', asyncHandler(adminController.listUsers));
router.get('/properties', asyncHandler(adminController.listProperties));
router.get('/bookings', asyncHandler(adminController.listBookings));
router.patch('/bookings/:id', asyncHandler(adminController.updateBookingStatus));

export default router;
