'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { groupBookingService } from '@/lib/services/groupBooking.service';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/shared/Button';

export default function VerifyGroupPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    if (reference) {
      verifyPayment(reference);
    } else {
      setError('Payment reference not found');
      setVerifying(false);
    }
  }, [reference]);

  const verifyPayment = async (ref: string) => {
    try {
      const data = await groupBookingService.verifyPayment(ref);
      setSuccess(true);
      setPaymentData(data);

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        router.push(`/group-bookings/${data.participant.groupBookingId}`);
      }, 3000);
    } catch (err: any) {
      setSuccess(false);
      setError(err.message || 'Payment verification failed');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {verifying && (
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-[#2D7A3E] mb-4"></div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Verifying Payment...
                </h2>
                <p className="text-gray-600">
                  Please wait while we confirm your payment
                </p>
              </div>
            )}

            {!verifying && success && (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Payment Successful!
                </h2>
                <p className="text-gray-600 mb-4">
                  Your payment has been confirmed. You are now part of the group booking!
                </p>

                {paymentData && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount Paid:</span>
                        <span className="font-bold text-gray-900">
                          NGN {paymentData.payment.amount.toLocaleString('en-NG', {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reference:</span>
                        <span className="font-mono text-xs text-gray-900">
                          {paymentData.payment.reference}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="text-gray-900 capitalize">
                          {paymentData.payment.channel}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {paymentData?.groupStatus?.readyForConfirmation && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-green-800 font-semibold">
                      All participants have paid! The group booking is ready for equipment owner confirmation.
                    </p>
                  </div>
                )}

                <p className="text-sm text-gray-500 mb-4">
                  Redirecting to group booking details in 3 seconds...
                </p>

                <Button
                  variant="primary"
                  onClick={() =>
                    router.push(`/group-bookings/${paymentData.participant.groupBookingId}`)
                  }
                  className="w-full"
                >
                  View Group Booking
                </Button>
              </div>
            )}

            {!verifying && !success && (
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Payment Verification Failed
                </h2>
                <p className="text-gray-600 mb-6">{error}</p>

                <div className="space-y-3">
                  <Button
                    variant="primary"
                    onClick={() => router.push('/dashboard/bookings')}
                    className="w-full"
                  >
                    Go to Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/equipment')}
                    className="w-full"
                  >
                    Browse Equipment
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
