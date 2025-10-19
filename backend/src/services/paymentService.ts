import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

interface InitializePaymentData {
  email: string;
  amount: number; // in kobo (multiply Naira by 100)
  reference: string;
  metadata?: Record<string, any>;
  callback_url?: string;
}

interface VerifyPaymentResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: Record<string, any>;
    customer: {
      id: number;
      first_name: string | null;
      last_name: string | null;
      email: string;
      customer_code: string;
      phone: string | null;
      metadata: Record<string, any> | null;
      risk_action: string;
    };
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
      account_name: string | null;
    };
  };
}

class PaymentService {
  /**
   * Initialize a payment transaction
   */
  async initializePayment(data: InitializePaymentData) {
    try {
      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/transaction/initialize`,
        data,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error('Paystack initialization error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to initialize payment',
      };
    }
  }

  /**
   * Verify a payment transaction
   */
  async verifyPayment(reference: string): Promise<VerifyPaymentResponse | null> {
    try {
      const response = await axios.get(
        `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Paystack verification error:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Generate a unique payment reference
   */
  generateReference(prefix: string = 'FMS'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Convert Naira to Kobo (Paystack uses kobo)
   */
  nairaToKobo(naira: number): number {
    return Math.round(naira * 100);
  }

  /**
   * Convert Kobo to Naira
   */
  koboToNaira(kobo: number): number {
    return kobo / 100;
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(reference: string): Promise<{
    status: string;
    amount: number;
    paid: boolean;
  } | null> {
    try {
      const verification = await this.verifyPayment(reference);

      if (!verification || !verification.status) {
        return null;
      }

      return {
        status: verification.data.status,
        amount: this.koboToNaira(verification.data.amount),
        paid: verification.data.status === 'success',
      };
    } catch (error) {
      console.error('Error getting transaction status:', error);
      return null;
    }
  }
}

export default new PaymentService();
