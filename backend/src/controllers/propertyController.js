import * as propertyService from '../services/propertyService.js';

export const listProperties = async (req, res) => {
  const properties = await propertyService.listProperties(req.query, false);
  res.json({ properties });
};

export const listMyProperties = async (req, res) => {
  const properties = await propertyService.listMyProperties(req.user.id);
  res.json({ properties });
};

export const getPropertyById = async (req, res) => {
  const property = await propertyService.getPropertyById(Number(req.params.id), false);
  res.json({ property });
};

export const createProperty = async (req, res) => {
  const property = await propertyService.createProperty(req.body, req.user);
  res.status(201).json({ property, message: 'Объект құрылды' });
};

export const updateProperty = async (req, res) => {
  const property = await propertyService.updateProperty(Number(req.params.id), req.body, req.user);
  res.json({ property, message: 'Объект жаңартылды' });
};

export const deleteProperty = async (req, res) => {
  const result = await propertyService.deleteProperty(Number(req.params.id), req.user);
  res.json(result);
};
