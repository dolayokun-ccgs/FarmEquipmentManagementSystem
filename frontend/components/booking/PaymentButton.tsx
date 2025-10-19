'use client';

import { useState } from 'react';
import paymentService from '@/lib/services/paymentService';

interface PaymentButtonProps {
  bookingId: string;
  amount: number;
  userEmail: string;
  token: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function PaymentButton({
  bookingId,
  amount,
  userEmail,
  token,
  onSuccess,
  onError,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Initialize payment
      const response = await paymentService.initializePayment(bookingId, userEmail, token);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to initialize payment');
      }

      // Redirect to Paystack payment page
      paymentService.redirectToPayment(response.data.authorization_url);

      // Note: The user will be redirected away from our app
      // They will return via the callback URL after payment
    } catch (error: any) {
      console.error('Payment error:', error);
      setLoading(false);
      if (onError) {
        onError(error.message || 'Failed to initialize payment');
      } else {
        alert('Payment initialization failed. Please try again.');
      }
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
        loading
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
      }`}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </span>
      ) : (
        `Pay NGN ${amount.toLocaleString()} with Paystack`
      )}
    </button>
  );
}
