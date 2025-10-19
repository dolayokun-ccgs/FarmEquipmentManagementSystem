import { Router } from 'express';
import { getDashboardStats } from '../controllers/stats.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get dashboard statistics
router.get('/dashboard', getDashboardStats);

export default router;
