import express from 'express';
import * as c from '../controllers/requestController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', c.getRequests);
router.get('/:id', c.getRequestById);
router.post('/', authorize('foreman', 'admin'), c.createRequest);

// Supplier updates purchase requests | Storekeeper issues from warehouse
router.patch('/:id/status', authorize('supplier', 'storekeeper', 'admin'), c.updateStatus);

// Storekeeper marks as issued (deducts stock)
router.post('/:id/issue', authorize('storekeeper', 'admin'), c.issueRequest);

// Foreman confirms receipt (only own requests)
router.post('/:id/confirm', authorize('foreman'), c.confirmReceipt);

export default router;
