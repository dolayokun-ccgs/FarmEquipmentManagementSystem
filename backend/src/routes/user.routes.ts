import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  createUser,
  getUserStats,
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get user statistics
router.get('/stats/summary', getUserStats);

// Get all users
router.get('/', getAllUsers);

// Create new user
router.post('/', createUser);

// Get user by ID
router.get('/:id', getUserById);

// Update user
router.patch('/:id', updateUser);

// Delete user
router.delete('/:id', deleteUser);

export default router;
