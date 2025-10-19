'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';
import { useEquipmentStore } from '@/lib/store/equipment.store';
import { Equipment } from '@/lib/types';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/shared/Button';

export default function MyEquipmentPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { equipment, isLoading, fetchEquipment, deleteEquipment } = useEquipmentStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard/equipment');
      return;
    }

    if (user && (user.role === 'PLATFORM_OWNER' || user.role === 'ADMIN')) {
      fetchEquipment({ ownerId: user.id });
    }
  }, [isAuthenticated, authLoading, user, router, fetchEquipment]);

  // Filter equipment owned by current user
  const myEquipment = equipment?.filter(eq => eq.ownerId === user?.id) || [];

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this equipment?')) {
      return;
    }

    setDeleteId(id);
    try {
      await deleteEquipment(id);
      // Refresh the list
      if (user) {
        fetchEquipment({ ownerId: user.id });
      }
    } catch (error) {
      alert('Failed to delete equipment');
    } finally {
      setDeleteId(null);
    }
  };

  if (authLoading) {
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

  if (!user || (user.role !== 'PLATFORM_OWNER' && user.role !== 'ADMIN')) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-700 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">You need to be a platform owner to access this page.</p>
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
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#021f5c] to-[#03296b] text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">My Equipment</h1>
                <p className="text-lg opacity-90">Manage your equipment listings</p>
              </div>
              <Button
                variant="secondary"
                onClick={() => router.push('/dashboard/equipment/add')}
                className="bg-[#fdca2e] text-[#021f5c] hover:bg-[#e6b829]"
              >
                ➕ Add New Equipment
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D7A3E]"></div>
            </div>
          ) : myEquipment.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">🚜</div>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">No Equipment Listed</h2>
              <p className="text-gray-600 mb-6">
                You haven't listed any equipment yet. Start by adding your first piece of equipment!
              </p>
              <Button
                variant="primary"
                onClick={() => router.push('/dashboard/equipment/add')}
              >
                Add Equipment
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {myEquipment.map((item) => {
                const images = item.images
                  ? typeof item.images === 'string'
                    ? JSON.parse(item.images)
                    : item.images
                  : [];
                const imageUrl = images.length > 0 ? images[0] : '/placeholder-equipment.jpg';

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Image */}
                      <div className="md:w-64 h-48 md:h-auto bg-gray-200">
                        <img
                          src={imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-equipment.jpg';
                          }}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-[#021f5c] mb-1">
                              {item.name}
                            </h3>
                            {item.category && (
                              <span className="inline-block bg-[#2D7A3E] text-white px-3 py-1 rounded-full text-xs font-semibold">
                                {item.category.name}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                item.isAvailable
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {item.isAvailable ? 'Available' : 'Not Available'}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              {item.condition}
                            </span>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {item.description || 'No description available.'}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500">Price per day</p>
                            <p className="text-lg font-bold text-[#2D7A3E]">
                              ₦{Number(item.pricePerDay).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Location</p>
                            <p className="text-sm font-semibold text-gray-700">
                              {item.locationCity}, {item.locationState}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Bookings</p>
                            <p className="text-sm font-semibold text-gray-700">
                              {item._count?.bookings || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Reviews</p>
                            <p className="text-sm font-semibold text-gray-700">
                              {item._count?.reviews || 0}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            onClick={() => router.push(`/equipment/${item.id}`)}
                            className="flex-1"
                          >
                            👁️ View
                          </Button>
                          <Button
                            variant="primary"
                            onClick={() => router.push(`/dashboard/equipment/edit/${item.id}`)}
                            className="flex-1"
                          >
                            ✏️ Edit
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleDelete(item.id)}
                            disabled={deleteId === item.id}
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                          >
                            {deleteId === item.id ? '...' : '🗑️ Delete'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
