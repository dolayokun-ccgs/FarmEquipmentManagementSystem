'use client';

import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Import content without SSR to prevent hydration errors
const BookingsContent = dynamic(() => import('./BookingsContent'), { ssr: false });

export default function BookingsPage() {
  return (
    <>
      <Header />
      <BookingsContent />
      <Footer />
    </>
  );
}
