'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';
import { useBookingStore } from '@/lib/store/booking.store';
import { BookingStatus, Booking } from '@/lib/types';
import Button from '@/components/shared/Button';
import PaymentButton from '@/components/booking/PaymentButton';
import { toast } from 'react-hot-toast';

export default function BookingsContent() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { bookings, pagination, isLoading, fetchBookings, updateBooking, deleteBooking, updateBookingStatus, cancelBooking } = useBookingStore();

  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editForm, setEditForm] = useState({ startDate: '', endDate: '', notes: '' });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard/bookings');
      return;
    }
    if (isAuthenticated) {
      fetchBookings(1, 20, statusFilter || undefined);
    }
  }, [isAuthenticated, authLoading, statusFilter, router, fetchBookings]);

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      fetchBookings(pagination.page, pagination.limit, statusFilter || undefined);
    } catch (error: any) {
      alert(error.message || 'Failed to update booking status');
    }
  };

  const handleCancel = async (bookingId: string) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    try {
      await cancelBooking(bookingId, reason);
      toast.success('Booking cancelled successfully');
      fetchBookings(pagination.page, pagination.limit, statusFilter || undefined);
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel booking');
    }
  };

  const handleEditClick = (booking: Booking) => {
    setEditingBooking(booking);
    setEditForm({
      startDate: booking.startDate.split('T')[0],
      endDate: booking.endDate.split('T')[0],
      notes: booking.notes || '',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    try {
      await updateBooking(editingBooking.id, editForm);
      toast.success('Booking updated successfully');
      setEditingBooking(null);
      fetchBookings(pagination.page, pagination.limit, statusFilter || undefined);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update booking');
    }
  };

  const handleDelete = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteBooking(bookingId);
      toast.success('Booking deleted successfully');
      fetchBookings(pagination.page, pagination.limit, statusFilter || undefined);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete booking');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      ACTIVE: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (authLoading || !user) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D7A3E]"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#021f5c] to-[#03296b] text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
          <p className="text-lg opacity-90">
            Manage your equipment bookings
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex items-center gap-4 flex-wrap">
          <label className="font-semibold text-[#021f5c]">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BookingStatus | '')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7A3E]"
          >
            <option value="">All Statuses</option>
            <option value={BookingStatus.PENDING}>Pending</option>
            <option value={BookingStatus.CONFIRMED}>Confirmed</option>
            <option value={BookingStatus.ACTIVE}>Active</option>
            <option value={BookingStatus.COMPLETED}>Completed</option>
            <option value={BookingStatus.CANCELLED}>Cancelled</option>
          </select>

          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="ml-auto"
          >
            ← Back to Dashboard
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D7A3E]"></div>
          </div>
        )}

        {/* No Bookings */}
        {!isLoading && (!bookings || bookings.length === 0) && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-[#021f5c] mb-2">No Bookings Found</h2>
            <p className="text-gray-600 mb-6">
              {statusFilter
                ? `No bookings with status "${statusFilter}"`
                : "You haven't made any bookings yet"}
            </p>
            <Button variant="primary" onClick={() => router.push('/equipment')}>
              Browse Equipment
            </Button>
          </div>
        )}

        {/* Bookings List */}
        {!isLoading && bookings && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Equipment Image */}
                  {booking.equipment && (
                    <div className="w-full lg:w-48 h-48 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={
                          booking.equipment.images
                            ? JSON.parse(booking.equipment.images as any)[0]
                            : '/placeholder-equipment.jpg'
                        }
                        alt={booking.equipment.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-equipment.jpg';
                        }}
                      />
                    </div>
                  )}

                  {/* Booking Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-[#021f5c] mb-1">
                          {booking.equipment?.name || 'Equipment'}
                        </h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#2D7A3E]">
                          ₦{Number(booking.totalPrice).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {booking.totalDays} {booking.totalDays === 1 ? 'day' : 'days'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm">
                      <div>
                        <span className="font-semibold text-gray-700">Start Date:</span>{' '}
                        {new Date(booking.startDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">End Date:</span>{' '}
                        {new Date(booking.endDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Booked On:</span>{' '}
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Payment:</span>{' '}
                        <span
                          className={`font-semibold ${
                            booking.paymentStatus === 'PAID'
                              ? 'text-green-600'
                              : 'text-yellow-600'
                          }`}
                        >
                          {booking.paymentStatus}
                        </span>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <span className="font-semibold text-gray-700 text-sm">Notes:</span>{' '}
                        <span className="text-gray-600 text-sm">{booking.notes}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      {/* Payment Button for Farmers with Pending Payment */}
                      {booking.paymentStatus === 'PENDING' && user.role === 'FARMER' && (
                        <div className="w-full mb-2">
                          <PaymentButton
                            bookingId={booking.id}
                            amount={Number(booking.totalPrice)}
                            userEmail={user.email}
                            token={typeof window !== 'undefined' ? localStorage.getItem('accessToken') || '' : ''}
                          />
                        </div>
                      )}

                      {booking.status === BookingStatus.PENDING && user.role === 'PLATFORM_OWNER' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleStatusChange(booking.id, BookingStatus.CONFIRMED)}
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancel(booking.id)}
                          >
                            Decline
                          </Button>
                        </>
                      )}

                      {booking.status === BookingStatus.CONFIRMED && (
                        <Button
                          variant="green"
                          size="sm"
                          onClick={() => handleStatusChange(booking.id, BookingStatus.ACTIVE)}
                        >
                          Mark as Active
                        </Button>
                      )}

                      {booking.status === BookingStatus.ACTIVE && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleStatusChange(booking.id, BookingStatus.COMPLETED)}
                        >
                          Complete
                        </Button>
                      )}

                      {/* Edit and Delete buttons - Only for farmers with pending payment */}
                      {user.role === 'FARMER' && booking.paymentStatus === 'PENDING' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(booking)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(booking.id)}
                            className="!text-red-600 !border-red-600 hover:!bg-red-50"
                          >
                            Delete
                          </Button>
                        </>
                      )}

                      {[BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(
                        booking.status as BookingStatus
                      ) &&
                        user.role === 'FARMER' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancel(booking.id)}
                          >
                            Cancel Booking
                          </Button>
                        )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/equipment/${booking.equipmentId}`)}
                      >
                        View Equipment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Booking Modal */}
      {editingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-[#021f5c] mb-4">Edit Booking</h2>
            <p className="text-sm text-gray-600 mb-4">
              Equipment: <strong>{editingBooking.equipment?.name}</strong>
            </p>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={editForm.startDate}
                  onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7A3E]"
                  required
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={editForm.endDate}
                  onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                  min={editForm.startDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7A3E]"
                  required
                />
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7A3E]"
                  placeholder="Any special requests or notes..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Booking'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditingBooking(null)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
