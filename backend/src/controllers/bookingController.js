import * as bookingService from '../services/bookingService.js';

export const createBooking = async (req, res) => {
  const booking = await bookingService.createBooking(req.user.id, req.body);
  res.status(201).json({ booking, message: 'Бронь жасалды' });
};

export const listMyBookings = async (req, res) => {
  const bookings = await bookingService.listMyBookings(req.user.id);
  res.json({ bookings });
};

export const listHostBookings = async (req, res) => {
  const bookings = await bookingService.listHostBookings(req.user.id);
  res.json({ bookings });
};

export const cancelMyBooking = async (req, res) => {
  const result = await bookingService.cancelMyBooking(req.user.id, Number(req.params.id));
  res.json(result);
};

export const updateManagedBookingStatus = async (req, res) => {
  const result = await bookingService.updateManagedBookingStatus(req.user, Number(req.params.id), req.body.status);
  res.json(result);
};
