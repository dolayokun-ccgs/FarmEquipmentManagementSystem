import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface PaymentInitResponse {
  success: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  data?: {
    booking: any;
    payment: {
      reference: string;
      amount: number;
      currency: string;
      paid_at: string;
      channel: string;
    };
  };
}

class PaymentService {
  /**
   * Initialize a payment for a booking
   */
  async initializePayment(bookingId: string, email: string, token: string): Promise<PaymentInitResponse> {
    try {
      const response = await axios.post(
        `${API_URL}/payments/initialize`,
        {
          bookingId,
          email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to initialize payment',
      };
    }
  }

  /**
   * Verify a payment
   */
  async verifyPayment(reference: string): Promise<PaymentVerificationResponse> {
    try {
      const response = await axios.get(`${API_URL}/payments/verify/${reference}`);
      return response.data;
    } catch (error: any) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to verify payment',
      };
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(reference: string, token: string) {
    try {
      const response = await axios.get(`${API_URL}/payments/status/${reference}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Get payment status error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get payment status',
      };
    }
  }

  /**
   * Redirect to Paystack payment page
   */
  redirectToPayment(authorizationUrl: string) {
    window.location.href = authorizationUrl;
  }
}

export default new PaymentService();
