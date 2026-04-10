import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const hashPassword = (password) => bcrypt.hash(password, 12);

export const comparePassword = (password, hash) => bcrypt.compare(password, hash);

export const generateResetCode = () => String(Math.floor(100000 + Math.random() * 900000));

export const hashResetCode = (code) => crypto.createHash('sha256').update(code).digest('hex');
