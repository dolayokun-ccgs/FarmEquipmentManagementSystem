import { Request, Response } from 'express';
import paymentService from '../services/paymentService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Initialize a payment for a booking
 * POST /api/payments/initialize
 */
export const initializePayment = async (req: Request, res: Response) => {
  try {
    const { bookingId, email } = req.body;

    // Validate required fields
    if (!bookingId || !email) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and email are required',
      });
    }

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        equipment: true,
        farmer: true,
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if booking is already paid
    if (booking.paymentStatus === 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already paid',
      });
    }

    // Generate payment reference
    const reference = paymentService.generateReference('BOOKING');

    // Initialize payment with Paystack
    const amount = paymentService.nairaToKobo(Number(booking.totalPrice));

    const paymentData = {
      email,
      amount,
      reference,
      metadata: {
        bookingId: booking.id,
        equipmentId: booking.equipmentId,
        farmerId: booking.farmerId,
        equipmentName: booking.equipment.name,
        totalDays: booking.totalDays,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
      },
      callback_url: `${process.env.FRONTEND_URL}/bookings/payment/verify?reference=${reference}`,
    };

    const result = await paymentService.initializePayment(paymentData);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to initialize payment',
      });
    }

    // Store payment reference in booking (we'll add this field later)
    // For now, we can store it in booking notes temporarily
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        notes: `Payment Reference: ${reference}`,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Payment initialized successfully',
      data: {
        authorization_url: result.data.authorization_url,
        access_code: result.data.access_code,
        reference: result.data.reference,
      },
    });
  } catch (error: any) {
    console.error('Initialize payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Verify a payment
 * GET /api/payments/verify/:reference
 */
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: 'Payment reference is required',
      });
    }

    // Verify payment with Paystack
    const verification = await paymentService.verifyPayment(reference);

    if (!verification || !verification.status) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }

    const { data } = verification;

    // Check if payment was successful
    if (data.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: 'Payment was not successful',
        data: {
          status: data.status,
          gateway_response: data.gateway_response,
        },
      });
    }

    // Get booking ID from metadata
    const bookingId = data.metadata.bookingId;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID not found in payment metadata',
      });
    }

    // Update booking payment status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
      include: {
        equipment: true,
        farmer: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        booking: updatedBooking,
        payment: {
          reference: data.reference,
          amount: paymentService.koboToNaira(data.amount),
          currency: data.currency,
          paid_at: data.paid_at,
          channel: data.channel,
        },
      },
    });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Webhook handler for Paystack events
 * POST /api/payments/webhook
 */
export const paystackWebhook = async (req: Request, res: Response) => {
  try {
    const event = req.body;

    // Verify webhook signature (important for production)
    // const hash = crypto
    //   .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    //   .update(JSON.stringify(req.body))
    //   .digest('hex');

    // if (hash !== req.headers['x-paystack-signature']) {
    //   return res.status(400).send('Invalid signature');
    // }

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        // Payment was successful
        const bookingId = event.data.metadata.bookingId;

        if (bookingId) {
          await prisma.booking.update({
            where: { id: bookingId },
            data: {
              paymentStatus: 'PAID',
              status: 'CONFIRMED',
              confirmedAt: new Date(),
            },
          });
        }
        break;

      case 'charge.failed':
        // Payment failed
        console.log('Payment failed:', event.data);
        break;

      default:
        console.log('Unhandled event type:', event.event);
    }

    return res.status(200).send('Webhook received');
  } catch (error: any) {
    console.error('Webhook error:', error);
    return res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
    });
  }
};

/**
 * Get payment status
 * GET /api/payments/status/:reference
 */
export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: 'Payment reference is required',
      });
    }

    const status = await paymentService.getTransactionStatus(reference);

    if (!status) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    console.error('Get payment status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Initialize a payment for a group booking participant
 * POST /api/payments/initialize-group
 */
export const initializeGroupPayment = async (req: Request, res: Response) => {
  try {
    const { groupBookingId, email } = req.body;

    // Validate required fields
    if (!groupBookingId || !email) {
      return res.status(400).json({
        success: false,
        message: 'Group booking ID and email are required',
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Get participant details
    const participant = await prisma.groupParticipant.findFirst({
      where: {
        groupBookingId,
        farmerId: req.user.userId,
      },
      include: {
        groupBooking: {
          include: {
            equipment: true,
          },
        },
        farmer: true,
      },
    });

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'You are not a participant of this group booking',
      });
    }

    // Check if already paid
    if (participant.paymentStatus === 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'You have already paid for this group booking',
      });
    }

    // Generate payment reference
    const reference = paymentService.generateReference('GROUP');

    // Initialize payment with Paystack
    const amount = paymentService.nairaToKobo(Number(participant.shareAmount));

    const paymentData = {
      email,
      amount,
      reference,
      metadata: {
        groupBookingId: participant.groupBookingId,
        participantId: participant.id,
        equipmentId: participant.groupBooking.equipmentId,
        farmerId: participant.farmerId,
        equipmentName: participant.groupBooking.equipment.name,
        shareAmount: Number(participant.shareAmount),
        startDate: participant.groupBooking.startDate.toISOString(),
        endDate: participant.groupBooking.endDate.toISOString(),
      },
      callback_url: `${process.env.FRONTEND_URL}/group-bookings/payment/verify?reference=${reference}`,
    };

    const result = await paymentService.initializePayment(paymentData);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to initialize payment',
      });
    }

    // Store payment reference in participant record
    await prisma.groupParticipant.update({
      where: { id: participant.id },
      data: {
        paymentReference: reference,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Payment initialized successfully',
      data: {
        authorization_url: result.data.authorization_url,
        access_code: result.data.access_code,
        reference: result.data.reference,
        amount: Number(participant.shareAmount),
      },
    });
  } catch (error: any) {
    console.error('Initialize group payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Verify a group booking payment
 * GET /api/payments/verify-group/:reference
 */
export const verifyGroupPayment = async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: 'Payment reference is required',
      });
    }

    // Verify payment with Paystack
    const verification = await paymentService.verifyPayment(reference);

    if (!verification || !verification.status) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }

    const { data } = verification;

    // Check if payment was successful
    if (data.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: 'Payment was not successful',
        data: {
          status: data.status,
          gateway_response: data.gateway_response,
        },
      });
    }

    // Get participant ID from metadata
    const participantId = data.metadata.participantId;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID not found in payment metadata',
      });
    }

    // Update participant payment status
    const updatedParticipant = await prisma.groupParticipant.update({
      where: { id: participantId },
      data: {
        paymentStatus: 'PAID',
        paidAt: new Date(),
      },
      include: {
        groupBooking: {
          include: {
            equipment: true,
            participants: true,
          },
        },
        farmer: true,
      },
    });

    // Check if all participants have paid and minimum requirement met
    const allParticipants = updatedParticipant.groupBooking.participants;
    const allPaid = allParticipants.every((p) => p.paymentStatus === 'PAID');
    const minMet = allParticipants.length >= updatedParticipant.groupBooking.minParticipants;

    // If all conditions met, update group booking status to ready for confirmation
    if (allPaid && minMet) {
      await prisma.groupBooking.update({
        where: { id: updatedParticipant.groupBookingId },
        data: {
          status: 'FILLED',
        },
      });

      // Notify equipment owner that group booking is ready for confirmation
      // (This would be handled by notification service)
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        participant: updatedParticipant,
        payment: {
          reference: data.reference,
          amount: paymentService.koboToNaira(data.amount),
          currency: data.currency,
          paid_at: data.paid_at,
          channel: data.channel,
        },
        groupStatus: {
          allPaid,
          readyForConfirmation: allPaid && minMet,
        },
      },
    });
  } catch (error: any) {
    console.error('Verify group payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};
