import * as adminService from '../services/adminService.js';
import * as userService from '../services/userService.js';
import * as propertyService from '../services/propertyService.js';
import * as bookingService from '../services/bookingService.js';

export const getSummary = async (req, res) => {
  const summary = await adminService.getAdminSummary();
  res.json({ summary });
};

export const listUsers = async (req, res) => {
  const users = await userService.listUsers();
  res.json({ users });
};

export const listProperties = async (req, res) => {
  const properties = await propertyService.listProperties(req.query, true);
  res.json({ properties });
};

export const listBookings = async (req, res) => {
  const bookings = await bookingService.listAllBookings(req.query.status);
  res.json({ bookings });
};

export const updateBookingStatus = async (req, res) => {
  const result = await bookingService.updateBookingStatus(Number(req.params.id), req.body.status);
  res.json(result);
};
