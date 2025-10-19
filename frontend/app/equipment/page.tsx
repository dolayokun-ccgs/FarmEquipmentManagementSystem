'use client';

import { useEffect, useState } from 'react';
import { useEquipmentStore } from '@/lib/store/equipment.store';
import { EquipmentFilters as IEquipmentFilters, Category } from '@/lib/types';
import EquipmentCard from '@/components/equipment/EquipmentCard';
import EquipmentFilters from '@/components/equipment/EquipmentFilters';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function EquipmentPage() {
  const { equipment = [], pagination, isLoading, fetchEquipment } = useEquipmentStore();
  const [filters, setFilters] = useState<IEquipmentFilters>({ page: 1, limit: 20 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEquipment(filters);
    // Fetch categories (you can create a category store for this)
    // For now, we'll leave it empty
  }, [filters, fetchEquipment]);

  const handleFilterChange = (newFilters: IEquipmentFilters) => {
    setFilters({ ...newFilters, page: 1 }); // Reset to page 1 when filters change
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#021f5c] to-[#03296b] text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">Browse Farm Equipment</h1>
            <p className="text-lg opacity-90">
              Find the perfect equipment for your farming needs
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full bg-[#2D7A3E] text-white py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                {showFilters ? 'Hide' : 'Show'} Filters
              </button>
            </div>

            {/* Filters Sidebar */}
            <aside
              className={`lg:block ${
                showFilters ? 'block' : 'hidden'
              } lg:w-1/4`}
            >
              <EquipmentFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                categories={categories}
              />
            </aside>

            {/* Equipment Grid */}
            <div className="flex-1">
              {/* Results Count */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#021f5c]">
                  {pagination.total} {pagination.total === 1 ? 'Item' : 'Items'} Found
                </h2>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D7A3E]"></div>
                </div>
              )}

              {/* No Results */}
              {!isLoading && equipment.length === 0 && (
                <div className="text-center py-20">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No equipment found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your filters or search criteria
                  </p>
                </div>
              )}

              {/* Equipment Grid */}
              {!isLoading && equipment.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {equipment.map((item) => (
                      <EquipmentCard key={item.id} equipment={item} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Previous
                      </button>

                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-4 py-2 rounded-lg font-semibold ${
                              pagination.page === pageNum
                                ? 'bg-[#2D7A3E] text-white'
                                : 'bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
