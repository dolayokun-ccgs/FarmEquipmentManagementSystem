'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth.store';
import { UserRole } from '@/lib/types';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/shared/Button';
import axios from 'axios';

interface DashboardStats {
  overview: {
    totalEquipment: number;
    availableEquipment: number;
    totalBookings: number;
    totalFarmers: number;
    totalRevenue: number;
    thisMonthRevenue: number;
  };
  bookings: {
    pending: number;
    confirmed: number;
    active: number;
    completed: number;
    cancelled: number;
  };
  recentBookings: any[];
  topEquipment: any[];
  trends: {
    monthly: { month: string; count: number; revenue: number }[];
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch dashboard statistics for platform owners and admins
  useEffect(() => {
    const fetchStats = async () => {
      if (!user || (user.role !== UserRole.PLATFORM_OWNER && user.role !== UserRole.ADMIN)) {
        return;
      }

      setStatsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/stats/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setStats(response.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (isLoading || !user) {
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

  const dashboardCards = [
    {
      title: 'My Bookings',
      description: 'View and manage your equipment bookings',
      icon: '📅',
      link: '/dashboard/bookings',
      color: 'bg-blue-50',
      roles: [UserRole.FARMER, UserRole.PLATFORM_OWNER, UserRole.ADMIN],
    },
    {
      title: 'My Equipment',
      description: 'Manage your listed equipment',
      icon: '🚜',
      link: '/dashboard/equipment',
      color: 'bg-green-50',
      roles: [UserRole.PLATFORM_OWNER, UserRole.ADMIN],
    },
    {
      title: 'Add Equipment',
      description: 'List new equipment for rent',
      icon: '➕',
      link: '/dashboard/equipment/add',
      color: 'bg-yellow-50',
      roles: [UserRole.PLATFORM_OWNER, UserRole.ADMIN],
    },
    {
      title: 'All Bookings',
      description: 'View and manage all bookings across platform',
      icon: '📋',
      link: '/dashboard/admin/bookings',
      color: 'bg-orange-50',
      roles: [UserRole.PLATFORM_OWNER, UserRole.ADMIN],
    },
    {
      title: 'User Management',
      description: 'Manage platform users and permissions',
      icon: '👥',
      link: '/dashboard/admin/users',
      color: 'bg-indigo-50',
      roles: [UserRole.ADMIN],
    },
    {
      title: 'Profile Settings',
      description: 'Update your account information',
      icon: '⚙️',
      link: '/dashboard/profile',
      color: 'bg-purple-50',
      roles: [UserRole.FARMER, UserRole.PLATFORM_OWNER, UserRole.ADMIN],
    },
  ];

  const filteredCards = dashboardCards.filter((card) =>
    card.roles.includes(user.role as UserRole)
  );

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#021f5c] to-[#03296b] text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {user.firstName || 'User'}!
            </h1>
            <p className="text-lg opacity-90">
              {user.role === UserRole.FARMER
                ? 'Find and book farm equipment for your needs'
                : user.role === UserRole.PLATFORM_OWNER
                ? 'Manage your equipment listings and bookings'
                : 'Manage the platform'}
            </p>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="container mx-auto px-4 py-8">
          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#2D7A3E] rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {user.firstName?.[0] || 'U'}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#021f5c]">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-gray-600">{user.email}</p>
                <div className="mt-2">
                  <span className="inline-block bg-[#fdca2e] text-[#021f5c] px-3 py-1 rounded-full text-sm font-semibold">
                    {user.role.replace('_', ' ')}
                  </span>
                  {user.state && (
                    <span className="inline-block ml-2 bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                      📍 {user.state}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Statistics - Only for Platform Owners and Admins */}
          {(user.role === UserRole.PLATFORM_OWNER || user.role === UserRole.ADMIN) && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#021f5c] mb-4">Dashboard Overview</h2>

              {statsLoading ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D7A3E] mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading statistics...</p>
                </div>
              ) : stats ? (
                <>
                  {/* Overview Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-600 text-sm">Total Equipment</p>
                          <p className="text-3xl font-bold text-[#021f5c] mt-1">
                            {stats.overview.totalEquipment}
                          </p>
                          <p className="text-sm text-green-600 mt-1">
                            {stats.overview.availableEquipment} available
                          </p>
                        </div>
                        <div className="text-4xl">🚜</div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-600 text-sm">Total Bookings</p>
                          <p className="text-3xl font-bold text-[#021f5c] mt-1">
                            {stats.overview.totalBookings}
                          </p>
                          <p className="text-sm text-blue-600 mt-1">
                            {stats.bookings.active} active
                          </p>
                        </div>
                        <div className="text-4xl">📅</div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-600 text-sm">Total Revenue</p>
                          <p className="text-3xl font-bold text-[#021f5c] mt-1">
                            ₦{stats.overview.totalRevenue.toLocaleString()}
                          </p>
                          <p className="text-sm text-green-600 mt-1">
                            ₦{stats.overview.thisMonthRevenue.toLocaleString()} this month
                          </p>
                        </div>
                        <div className="text-4xl">💰</div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-600 text-sm">Total Farmers</p>
                          <p className="text-3xl font-bold text-[#021f5c] mt-1">
                            {stats.overview.totalFarmers}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">Unique customers</p>
                        </div>
                        <div className="text-4xl">👨‍🌾</div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-600 text-sm">Pending Bookings</p>
                          <p className="text-3xl font-bold text-[#021f5c] mt-1">
                            {stats.bookings.pending}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {stats.bookings.confirmed} confirmed
                          </p>
                        </div>
                        <div className="text-4xl">⏳</div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-600 text-sm">Completed</p>
                          <p className="text-3xl font-bold text-[#021f5c] mt-1">
                            {stats.bookings.completed}
                          </p>
                          <p className="text-sm text-red-600 mt-1">
                            {stats.bookings.cancelled} cancelled
                          </p>
                        </div>
                        <div className="text-4xl">✅</div>
                      </div>
                    </div>
                  </div>

                  {/* Top Equipment */}
                  {stats.topEquipment.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                      <h3 className="text-xl font-bold text-[#021f5c] mb-4">Top Performing Equipment</h3>
                      <div className="space-y-3">
                        {stats.topEquipment.map((equipment, index) => (
                          <div key={equipment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                              <div>
                                <p className="font-semibold text-[#021f5c]">{equipment.name}</p>
                                <p className="text-sm text-gray-600">
                                  {equipment.totalBookings} bookings
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">
                                ₦{equipment.totalRevenue.toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">Total revenue</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Monthly Trends */}
                  {stats.trends.monthly.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-xl font-bold text-[#021f5c] mb-4">Monthly Trends (Last 6 Months)</h3>
                      <div className="space-y-3">
                        {stats.trends.monthly.map((trend) => (
                          <div key={trend.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-semibold text-[#021f5c]">
                                {new Date(trend.month + '-01').toLocaleDateString('en-US', {
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </p>
                              <p className="text-sm text-gray-600">{trend.count} bookings</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">
                                ₦{trend.revenue.toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">Revenue</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <p className="text-gray-600">Failed to load statistics. Please try again later.</p>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#021f5c] mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredCards.map((card) => (
                <Link key={card.link} href={card.link}>
                  <div
                    className={`${card.color} rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer h-full border-2 border-transparent hover:border-[#2D7A3E]`}
                  >
                    <div className="text-4xl mb-3">{card.icon}</div>
                    <h3 className="text-lg font-bold text-[#021f5c] mb-2">
                      {card.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{card.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Browse Equipment CTA */}
          <div className="bg-gradient-to-r from-[#2D7A3E] to-[#245a31] rounded-lg p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-3">Need Equipment?</h2>
            <p className="text-lg mb-6 opacity-90">
              Browse our extensive catalog of farm equipment available for rent
            </p>
            <Button
              variant="secondary"
              onClick={() => router.push('/equipment')}
              className="bg-[#fdca2e] text-[#021f5c] hover:bg-[#e6b829]"
            >
              Browse Equipment →
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
