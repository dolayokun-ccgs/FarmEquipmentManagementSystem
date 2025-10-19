'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEquipmentStore } from '@/lib/store/equipment.store';
import { useBookingStore } from '@/lib/store/booking.store';
import { useAuthStore } from '@/lib/store/auth.store';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/shared/Button';

export default function EquipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { currentEquipment, isLoading, fetchEquipmentById, clearCurrentEquipment } =
    useEquipmentStore();
  const { createBooking, isLoading: bookingLoading } = useBookingStore();
  const { isAuthenticated, user } = useAuthStore();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    if (id) {
      fetchEquipmentById(id);
    }
    return () => clearCurrentEquipment();
  }, [id, fetchEquipmentById, clearCurrentEquipment]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');

    if (!isAuthenticated) {
      router.push('/login?redirect=/equipment/' + id);
      return;
    }

    if (!startDate || !endDate) {
      setBookingError('Please select both start and end dates');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setBookingError('End date must be after start date');
      return;
    }

    try {
      await createBooking({
        equipmentId: id,
        startDate,
        endDate,
        notes,
      });
      router.push('/dashboard/bookings');
    } catch (error: any) {
      setBookingError(error.message || 'Failed to create booking');
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D7A3E]"></div>
        </main>
        <Footer />
      </>
    );
  }

  if (!currentEquipment) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-700 mb-4">Equipment Not Found</h1>
            <Button variant="primary" onClick={() => router.push('/equipment')}>
              Browse Equipment
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const images = currentEquipment.images
    ? typeof currentEquipment.images === 'string'
      ? JSON.parse(currentEquipment.images)
      : currentEquipment.images
    : [];

  const specifications = currentEquipment.specifications
    ? typeof currentEquipment.specifications === 'string'
      ? JSON.parse(currentEquipment.specifications)
      : currentEquipment.specifications
    : null;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-6"
          >
            ← Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Images */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="relative h-96 bg-gray-200">
                  <img
                    src={images.length > 0 ? images[0] : '/placeholder-equipment.jpg'}
                    alt={currentEquipment.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-equipment.jpg';
                    }}
                  />
                  {!currentEquipment.isAvailable && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-lg font-bold">
                      Not Available
                    </div>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 p-4">
                    {images.slice(1, 5).map((img: string, idx: number) => (
                      <div key={idx} className="h-24 bg-gray-200 rounded overflow-hidden">
                        <img
                          src={img}
                          alt={`${currentEquipment.name} ${idx + 2}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h1 className="text-3xl font-bold text-[#021f5c] mb-4">
                  {currentEquipment.name}
                </h1>

                {currentEquipment.category && (
                  <div className="inline-block bg-[#2D7A3E] text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
                    {currentEquipment.category.name}
                  </div>
                )}

                <div className="flex items-center gap-4 mb-6">
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">Condition:</span> {currentEquipment.condition}
                  </div>
                  {currentEquipment.locationState && (
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold">Location:</span> {currentEquipment.locationCity}, {currentEquipment.locationState}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h2 className="text-xl font-bold text-[#021f5c] mb-3">Description</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {currentEquipment.description || 'No description available.'}
                  </p>
                </div>

                {specifications && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h2 className="text-xl font-bold text-[#021f5c] mb-3">Specifications</h2>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(specifications).map(([key, value]) => (
                        <div key={key}>
                          <dt className="font-semibold text-gray-700">{key}:</dt>
                          <dd className="text-gray-600">{String(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}

                {currentEquipment.owner && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h2 className="text-xl font-bold text-[#021f5c] mb-3">Government Provider</h2>
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border-l-4 border-[#2D7A3E]">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-[#021f5c] rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
                          <svg
                            className="w-8 h-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-bold text-[#021f5c] text-lg">
                            {currentEquipment.owner.firstName} {currentEquipment.owner.lastName}
                          </p>
                          <p className="text-sm text-gray-700 font-medium">Government Equipment Provider</p>
                          <p className="text-xs text-gray-600 mt-1">
                            Serving farmers in {currentEquipment.locationState} State
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <div className="mb-6">
                  <div className="text-4xl font-bold text-[#2D7A3E]">
                    ₦{Number(currentEquipment.pricePerDay).toLocaleString()}
                  </div>
                  <div className="text-gray-600">per day</div>
                </div>

                {currentEquipment.isAvailable ? (
                  <form onSubmit={handleBooking}>
                    <div className="mb-4">
                      <label className="block text-sm font-bold text-[#021f5c] mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7A3E]"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-bold text-[#021f5c] mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        required
                        min={startDate || new Date().toISOString().split('T')[0]}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7A3E]"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-bold text-[#021f5c] mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7A3E]"
                        placeholder="Any special requirements..."
                      />
                    </div>

                    {bookingError && (
                      <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                        {bookingError}
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full"
                      disabled={bookingLoading}
                    >
                      {bookingLoading ? 'Booking...' : 'Book Now'}
                    </Button>

                    {!isAuthenticated && (
                      <p className="text-sm text-gray-600 text-center mt-3">
                        You'll be redirected to login
                      </p>
                    )}
                  </form>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-red-600 font-semibold mb-2">Currently Unavailable</p>
                    <p className="text-sm text-gray-600">
                      This equipment is not available for booking at the moment.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
