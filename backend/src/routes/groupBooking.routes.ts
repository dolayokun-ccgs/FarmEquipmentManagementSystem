import { Router } from 'express';
import {
  createGroupBooking,
  getAllGroupBookings,
  getGroupBookingById,
  joinGroupBooking,
  leaveGroupBooking,
  updateGroupBookingStatus,
  cancelGroupBooking,
  getAvailableGroupBookings,
} from '../controllers/groupBooking.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/group-bookings/available/:equipmentId
 * @desc    Get available group bookings for equipment
 * @access  Public
 */
router.get('/available/:equipmentId', getAvailableGroupBookings);

/**
 * @route   GET /api/group-bookings
 * @desc    Get all group bookings (filtered by user role)
 * @access  Private
 */
router.get('/', authenticate, getAllGroupBookings);

/**
 * @route   GET /api/group-bookings/:id
 * @desc    Get group booking by ID
 * @access  Private
 */
router.get('/:id', authenticate, getGroupBookingById);

/**
 * @route   POST /api/group-bookings
 * @desc    Create a new group booking
 * @access  Private (Farmer)
 */
router.post('/', authenticate, createGroupBooking);

/**
 * @route   POST /api/group-bookings/:id/join
 * @desc    Join a group booking
 * @access  Private (Farmer)
 */
router.post('/:id/join', authenticate, joinGroupBooking);

/**
 * @route   DELETE /api/group-bookings/:id/leave
 * @desc    Leave a group booking
 * @access  Private (Farmer)
 */
router.delete('/:id/leave', authenticate, leaveGroupBooking);

/**
 * @route   PATCH /api/group-bookings/:id/status
 * @desc    Update group booking status
 * @access  Private (Equipment owner or Admin)
 */
router.patch('/:id/status', authenticate, updateGroupBookingStatus);

/**
 * @route   PATCH /api/group-bookings/:id/cancel
 * @desc    Cancel group booking
 * @access  Private (Initiator or Admin)
 */
router.patch('/:id/cancel', authenticate, cancelGroupBooking);

export default router;
