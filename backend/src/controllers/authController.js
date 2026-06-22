import jwt from 'jsonwebtoken';
import { authService } from '../services/authService.js';
import env from '../config/env.js';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user.id);

  res.cookie(env.jwt.cookieName || 'staynest_token', token, {
    httpOnly: true,
    secure: env.isProduction || false,
    sameSite: (env.isProduction) ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 
  });

  // Return clean user object (no password)
  const safeUser = {
    id: user.id,
    fullName: user.fullName || user.full_name,
    email: user.email,
    role: user.role,
    is_approved: user.is_approved
  };

  res.status(statusCode).json({ user: safeUser });
};

export const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    // Dont auto login if not approved
    if (!user.is_approved) {
      res.status(201).json({ user, message: 'Тіркелу сәтті аяқталды. Бастықтың растауын күтіңіз.' });
    } else {
      sendTokenResponse(user, 201, res);
    }
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authService.login(email, password);
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.cookie(env.jwt.cookieName, 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax'
  });

  res.status(200).json({ success: true, message: 'Сәтті шықтыңыз' });
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};
