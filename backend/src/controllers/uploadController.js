import * as uploadService from '../services/uploadService.js';

export const uploadPropertyImages = async (req, res) => {
  const files = uploadService.mapUploadedImages(req.files, req);
  res.status(201).json({ files, message: 'Суреттер жүктелді' });
};
