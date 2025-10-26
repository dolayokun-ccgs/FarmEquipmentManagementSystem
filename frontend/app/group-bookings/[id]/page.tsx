'use client';

import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import GroupBookingDetails from '@/components/groupBooking/GroupBookingDetails';

export default function GroupBookingDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <GroupBookingDetails groupBookingId={id} />
        </div>
      </main>
      <Footer />
    </>
  );
}
