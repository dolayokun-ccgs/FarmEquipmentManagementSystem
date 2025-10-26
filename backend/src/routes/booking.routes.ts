import { Router } from 'express';
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  updateBookingStatus,
  cancelBooking,
  getEquipmentAvailability,
} from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/bookings/availability/:equipmentId
 * @desc    Get equipment availability
 * @access  Public
 */
router.get('/availability/:equipmentId', getEquipmentAvailability);

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings (filtered by user role)
 * @access  Private
 */
router.get('/', authenticate, getAllBookings);

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking by ID
 * @access  Private
 */
router.get('/:id', authenticate, getBookingById);

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking
 * @access  Private (Farmer)
 */
router.post('/', authenticate, createBooking);

/**
 * @route   PATCH /api/bookings/:id
 * @desc    Update booking details (dates, notes)
 * @access  Private (Farmer who made the booking, only if payment is PENDING)
 */
router.patch('/:id', authenticate, updateBooking);

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Delete booking completely
 * @access  Private (Farmer who made the booking, only if payment is PENDING)
 */
router.delete('/:id', authenticate, deleteBooking);

/**
 * @route   PATCH /api/bookings/:id/status
 * @desc    Update booking status (confirm/reject)
 * @access  Private (Equipment owner)
 */
router.patch('/:id/status', authenticate, updateBookingStatus);

/**
 * @route   PATCH /api/bookings/:id/cancel
 * @desc    Cancel booking
 * @access  Private (Farmer who made the booking)
 */
router.patch('/:id/cancel', authenticate, cancelBooking);

export default router;
