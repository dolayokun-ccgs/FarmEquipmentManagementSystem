import { Router } from 'express';
import { sendContactMessage } from '../controllers/contact.controller';

const router = Router();

/**
 * @route   POST /api/contact
 * @desc    Send contact form message
 * @access  Public
 */
router.post('/', sendContactMessage);

export default router;
