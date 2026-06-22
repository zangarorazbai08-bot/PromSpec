import { materialService } from '../services/materialService.js';

export const getMaterials = async (req, res, next) => {
  try {
    const materials = await materialService.getMaterials(req.query);
    res.json({ materials });
  } catch (error) {
    next(error);
  }
};

export const getMaterialById = async (req, res, next) => {
  try {
    const material = await materialService.getMaterialById(req.params.id);
    res.json({ material });
  } catch (error) {
    next(error);
  }
};

export const createMaterial = async (req, res, next) => {
  try {
    const material = await materialService.createMaterial(req.body);
    res.status(201).json({ material });
  } catch (error) {
    next(error);
  }
};

export const updateMaterial = async (req, res, next) => {
  try {
    const material = await materialService.updateMaterial(req.params.id, req.body);
    res.json({ material });
  } catch (error) {
    next(error);
  }
};
