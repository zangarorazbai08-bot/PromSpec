import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import multer from 'multer';
import env from '../config/env.js';
import { createError } from '../utils/httpError.js';
import { propertyUploadsDir } from '../utils/paths.js';

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

const storage = multer.diskStorage({
  destination(req, file, callback) {
    fs.mkdirSync(propertyUploadsDir, { recursive: true });
    callback(null, propertyUploadsDir);
  },
  filename(req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${randomUUID()}${extension}`);
  }
});

const fileFilter = (req, file, callback) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    callback(createError(400, 'Тек JPEG, PNG, WEBP, GIF немесе AVIF суреттерін жүктеуге болады'));
    return;
  }

  callback(null, true);
};

export const propertyImageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.upload.maxImageSizeMb * 1024 * 1024,
    files: env.upload.maxImageCount
  }
});
