'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';
import { BookingStatus } from '@/lib/types';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/shared/Button';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminBookingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard/admin/bookings');
      return;
    }

    if (user && user.role !== 'PLATFORM_OWNER' && user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    if (isAuthenticated) {
      fetchAllBookings();
    }
  }, [isAuthenticated, authLoading, user, router, statusFilter]);

  const fetchAllBookings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const params: any = { page: pagination.page, limit: pagination.limit };

      if (statusFilter) params.status = statusFilter;

      const response = await axios.get(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      if (response.data.success) {
        setBookings(response.data.data.bookings || response.data.data.data || []);
        if (response.data.data.pagination) {
          setPagination(response.data.data.pagination);
        }
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch(
        `${API_URL}/bookings/${bookingId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAllBookings();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update booking status');
    }
  };

  const handleCancel = async (bookingId: string) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch(
        `${API_URL}/bookings/${bookingId}/cancel`,
        { cancellationReason: reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAllBookings();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to cancel booking');
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
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getPaymentBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      PAID: 'bg-green-50 text-green-700 border-green-200',
      FAILED: 'bg-red-50 text-red-700 border-red-200',
      REFUNDED: 'bg-gray-50 text-gray-700 border-gray-200',
    };

    return (
      <span className={`px-2 py-1 rounded border text-xs font-semibold ${colors[status] || 'bg-gray-50 text-gray-700'}`}>
        {status}
      </span>
    );
  };

  const filteredBookings = bookings.filter((booking) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      booking.equipment?.name.toLowerCase().includes(search) ||
      booking.farmer?.firstName?.toLowerCase().includes(search) ||
      booking.farmer?.lastName?.toLowerCase().includes(search) ||
      booking.farmer?.email?.toLowerCase().includes(search)
    );
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
    active: bookings.filter(b => b.status === 'ACTIVE').length,
    completed: bookings.filter(b => b.status === 'COMPLETED').length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
  };

  if (authLoading || !user) {
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

  if (user.role !== 'PLATFORM_OWNER' && user.role !== 'ADMIN') {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-700 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">Only platform owners can access this page.</p>
            <Button variant="primary" onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#021f5c] to-[#03296b] text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">All Bookings Management</h1>
                <p className="text-lg opacity-90">Monitor and manage all equipment bookings</p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="border-white text-white hover:bg-white/10"
              >
                ← Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-[#021f5c]">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="bg-yellow-50 rounded-lg shadow-md p-4 text-center border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-800">{stats.pending}</div>
              <div className="text-sm text-yellow-700">Pending</div>
            </div>
            <div className="bg-blue-50 rounded-lg shadow-md p-4 text-center border border-blue-200">
              <div className="text-2xl font-bold text-blue-800">{stats.confirmed}</div>
              <div className="text-sm text-blue-700">Confirmed</div>
            </div>
            <div className="bg-green-50 rounded-lg shadow-md p-4 text-center border border-green-200">
              <div className="text-2xl font-bold text-green-800">{stats.active}</div>
              <div className="text-sm text-green-700">Active</div>
            </div>
            <div className="bg-gray-50 rounded-lg shadow-md p-4 text-center border border-gray-200">
              <div className="text-2xl font-bold text-gray-800">{stats.completed}</div>
              <div className="text-sm text-gray-700">Completed</div>
            </div>
            <div className="bg-red-50 rounded-lg shadow-md p-4 text-center border border-red-200">
              <div className="text-2xl font-bold text-red-800">{stats.cancelled}</div>
              <div className="text-sm text-red-700">Cancelled</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#021f5c] mb-2">Search</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by equipment, farmer name, or email..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7A3E]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#021f5c] mb-2">Filter by Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7A3E]"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D7A3E]"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">No Bookings Found</h2>
              <p className="text-gray-600">
                {searchTerm || statusFilter
                  ? 'Try adjusting your filters'
                  : 'No bookings have been made yet'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#021f5c] text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-bold">Booking ID</th>
                      <th className="px-4 py-3 text-left text-sm font-bold">Equipment</th>
                      <th className="px-4 py-3 text-left text-sm font-bold">Farmer</th>
                      <th className="px-4 py-3 text-left text-sm font-bold">Dates</th>
                      <th className="px-4 py-3 text-left text-sm font-bold">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-bold">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-bold">Payment</th>
                      <th className="px-4 py-3 text-left text-sm font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs font-mono text-gray-600">
                          {booking.id.slice(0, 8)}...
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-[#021f5c] text-sm">
                            {booking.equipment?.name || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {booking.equipment?.locationCity}, {booking.equipment?.locationState}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-sm">
                            {booking.farmer?.firstName} {booking.farmer?.lastName}
                          </div>
                          <div className="text-xs text-gray-500">{booking.farmer?.email}</div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div>{new Date(booking.startDate).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">
                            to {new Date(booking.endDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            ({booking.totalDays} {booking.totalDays === 1 ? 'day' : 'days'})
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-[#2D7A3E]">
                            ₦{Number(booking.totalPrice).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(booking.status)}
                        </td>
                        <td className="px-4 py-3">
                          {getPaymentBadge(booking.paymentStatus)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            {booking.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(booking.id, 'CONFIRMED')}
                                  className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => handleCancel(booking.id)}
                                  className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                >
                                  Decline
                                </button>
                              </>
                            )}
                            {booking.status === 'CONFIRMED' && (
                              <button
                                onClick={() => handleStatusChange(booking.id, 'ACTIVE')}
                                className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                              >
                                Activate
                              </button>
                            )}
                            {booking.status === 'ACTIVE' && (
                              <button
                                onClick={() => handleStatusChange(booking.id, 'COMPLETED')}
                                className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                              >
                                Complete
                              </button>
                            )}
                            <button
                              onClick={() => router.push(`/equipment/${booking.equipmentId}`)}
                              className="px-2 py-1 bg-[#fdca2e] text-[#021f5c] text-xs rounded hover:bg-[#e6b829]"
                            >
                              View Equipment
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
