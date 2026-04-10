import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import * as bookingController from '../controllers/bookingController.js';

const router = Router();

router.post('/', requireAuth, asyncHandler(bookingController.createBooking));
router.get('/me', requireAuth, asyncHandler(bookingController.listMyBookings));
router.get('/host', requireAuth, asyncHandler(bookingController.listHostBookings));
router.patch('/:id/status', requireAuth, asyncHandler(bookingController.updateManagedBookingStatus));
router.patch('/:id/cancel', requireAuth, asyncHandler(bookingController.cancelMyBooking));

export default router;
