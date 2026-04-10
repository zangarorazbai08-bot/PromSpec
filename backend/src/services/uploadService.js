import fs from 'fs/promises';
import { createError } from '../utils/httpError.js';
import { propertyUploadsDir } from '../utils/paths.js';

export const ensureUploadDirectories = async () => {
  await fs.mkdir(propertyUploadsDir, { recursive: true });
};

const buildBaseUrl = (req) => {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol = typeof forwardedProto === 'string' ? forwardedProto.split(',')[0].trim() : req.protocol;
  return `${protocol}://${req.get('host')}`;
};

export const mapUploadedImages = (files, req) => {
  if (!files?.length) {
    throw createError(400, 'Жүктеу үшін кемінде бір сурет таңдаңыз');
  }

  const baseUrl = buildBaseUrl(req);

  return files.map((file) => ({
    name: file.originalname,
    size: file.size,
    url: `${baseUrl}/uploads/properties/${file.filename}`
  }));
};
