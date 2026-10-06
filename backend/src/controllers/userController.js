import { userService } from '../services/userService.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getUsers();
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

export const approveUser = async (req, res, next) => {
  try {
    const user = await userService.approveUser(req.params.id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.user.id, req.body);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const result = await userService.updatePassword(req.user.id, oldPassword, newPassword);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
