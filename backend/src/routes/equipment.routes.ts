import { Router } from 'express';
import {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getEquipmentByOwner,
  getMyEquipment,
} from '../controllers/equipment.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/equipment
 * @desc    Get all equipment with filters and pagination
 * @access  Public
 */
router.get('/', getAllEquipment);

/**
 * @route   GET /api/equipment/my-equipment
 * @desc    Get current user's equipment
 * @access  Private (Platform Owner)
 */
router.get(
  '/my-equipment',
  authenticate,
  authorize('PLATFORM_OWNER', 'ADMIN'),
  getMyEquipment
);

/**
 * @route   GET /api/equipment/owner/:ownerId
 * @desc    Get equipment by owner ID
 * @access  Public
 */
router.get('/owner/:ownerId', getEquipmentByOwner);

/**
 * @route   GET /api/equipment/:id
 * @desc    Get equipment by ID
 * @access  Public
 */
router.get('/:id', getEquipmentById);

/**
 * @route   POST /api/equipment
 * @desc    Create new equipment
 * @access  Private (Platform Owner only)
 */
router.post(
  '/',
  authenticate,
  authorize('PLATFORM_OWNER', 'ADMIN'),
  createEquipment
);

/**
 * @route   PUT /api/equipment/:id
 * @desc    Update equipment
 * @access  Private (Owner only)
 */
router.put('/:id', authenticate, updateEquipment);

/**
 * @route   DELETE /api/equipment/:id
 * @desc    Delete equipment
 * @access  Private (Owner only)
 */
router.delete('/:id', authenticate, deleteEquipment);

export default router;
