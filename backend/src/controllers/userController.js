import * as userService from '../services/userService.js';

export const getProfile = async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  res.json({ user });
};

export const updateProfile = async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);
  res.json({ user, message: 'Профиль жаңартылды' });
};
