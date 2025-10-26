'use client';

import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Import content without SSR to prevent hydration errors
const ProfileSettings = dynamic(() => import('./ProfileSettings'), { ssr: false });

export default function ProfilePage() {
  return (
    <>
      <Header />
      <ProfileSettings />
      <Footer />
    </>
  );
}
