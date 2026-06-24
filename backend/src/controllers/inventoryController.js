import { inventoryService } from '../services/inventoryService.js';
import { imageProcessingService } from '../services/imageProcessingService.js';

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

export const addScannedProduct = async (req, res, next) => {
  try {
    const transaction = await inventoryService.addScannedProduct(req.body, req.user.id);
    res.status(201).json({ transaction });
  } catch (error) {
    next(error);
  }
};

export const scanImage = async (req, res, next) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ message: 'Сурет (image) міндетті түрде жіберілуі керек' });
    }
    const result = await imageProcessingService.analyzeImageBase64(image);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

