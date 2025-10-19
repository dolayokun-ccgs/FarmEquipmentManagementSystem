'use client';

import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Import content without SSR to prevent hydration errors
const AddEquipmentContent = dynamic(() => import('./AddEquipmentContent'), { ssr: false });

export default function AddEquipmentPage() {
  return (
    <>
      <Header />
      <AddEquipmentContent />
      <Footer />
    </>
  );
}
