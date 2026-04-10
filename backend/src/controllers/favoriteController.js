import * as favoriteService from '../services/favoriteService.js';

export const listFavorites = async (req, res) => {
  const favorites = await favoriteService.listFavorites(req.user.id);
  res.json({ favorites });
};

export const addFavorite = async (req, res) => {
  const result = await favoriteService.addFavorite(req.user.id, Number(req.params.propertyId));
  res.status(201).json(result);
};

export const removeFavorite = async (req, res) => {
  const result = await favoriteService.removeFavorite(req.user.id, Number(req.params.propertyId));
  res.json(result);
};
