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
