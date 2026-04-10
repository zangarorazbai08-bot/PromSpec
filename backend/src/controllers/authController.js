import { getCookieOptions, signToken } from '../utils/token.js';
import env from '../config/env.js';
import * as authService from '../services/authService.js';

export const register = async (req, res) => {
  const user = await authService.register(req.body);
  const token = signToken(user);
  res.cookie(env.cookieName, token, getCookieOptions());
  res.status(201).json({ user, message: 'Тіркелу сәтті аяқталды' });
};

export const login = async (req, res) => {
  const user = await authService.login(req.body);
  const token = signToken(user);
  res.cookie(env.cookieName, token, getCookieOptions());
  res.json({ user, message: 'Кіру сәтті орындалды' });
};

export const logout = async (req, res) => {
  res.clearCookie(env.cookieName, {
    ...getCookieOptions(),
    maxAge: undefined
  });
  res.json({ message: 'Шығу орындалды' });
};

export const forgotPassword = async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  res.json(result);
};

export const resetPassword = async (req, res) => {
  const result = await authService.resetPassword(req.body);
  res.json(result);
};

export const me = async (req, res) => {
  res.json({ user: req.user });
};
