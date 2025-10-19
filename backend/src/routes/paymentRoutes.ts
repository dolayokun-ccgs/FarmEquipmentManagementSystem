import express from 'express';
import {
  initializePayment,
  verifyPayment,
  paystackWebhook,
  getPaymentStatus,
} from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * @route   POST /api/payments/initialize
 * @desc    Initialize a payment for a booking
 * @access  Private
 */
router.post('/initialize', authenticate, initializePayment);

/**
 * @route   GET /api/payments/verify/:reference
 * @desc    Verify a payment transaction
 * @access  Public (can be called from frontend after redirect)
 */
router.get('/verify/:reference', verifyPayment);

/**
 * @route   GET /api/payments/status/:reference
 * @desc    Get payment status
 * @access  Private
 */
router.get('/status/:reference', authenticate, getPaymentStatus);

/**
 * @route   POST /api/payments/webhook
 * @desc    Webhook endpoint for Paystack events
 * @access  Public (called by Paystack servers)
 */
router.post('/webhook', paystackWebhook);

export default router;
