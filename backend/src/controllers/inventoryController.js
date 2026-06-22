import { inventoryService } from '../services/inventoryService.js';

export const getTransactions = async (req, res, next) => {
  try {
    const transactions = await inventoryService.getTransactions(req.query);
    res.json({ transactions });
  } catch (error) {
    next(error);
  }
};

export const addTransaction = async (req, res, next) => {
  try {
    // Only 'in' (incoming) can be added directly via this endpoint usually, 
    // 'out' might be added via request fulfillment, but we'll allow both if storekeeper.
    const transaction = await inventoryService.addTransaction(req.body, req.user.id);
    res.status(201).json({ transaction });
  } catch (error) {
    next(error);
  }
};
