'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth.store';

interface MobileAuthButtonsProps {
  onClose: () => void;
}

export default function MobileAuthButtons({ onClose }: MobileAuthButtonsProps) {
  const { isAuthenticated, logout } = useAuthStore();

  if (isAuthenticated) {
    return (
      <>
        <Link
          href="/dashboard"
          className="text-center px-5 py-2.5 bg-white border-2 border-[#021f5c] text-[#021f5c] rounded-[25px] font-bold hover:bg-[#021f5c] hover:text-white transition-all uppercase text-sm"
          onClick={onClose}
        >
          Dashboard
        </Link>
        <button
          onClick={() => {
            logout();
            onClose();
          }}
          className="px-5 py-2.5 bg-[#F47920] text-white rounded-[25px] font-bold hover:bg-[#FFB366] transition-all uppercase text-sm"
        >
          Logout
        </button>
      </>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="text-center px-5 py-2.5 bg-white border-2 border-[#021f5c] text-[#021f5c] rounded-[25px] font-bold hover:bg-[#021f5c] hover:text-white transition-all uppercase text-sm"
        onClick={onClose}
      >
        Sign In
      </Link>
      <Link
        href="/register"
        className="text-center px-5 py-2.5 bg-[#fdca2e] text-[#021f5c] rounded-[25px] font-bold hover:bg-[#021f5c] hover:text-[#fdca2e] transition-all uppercase text-sm shadow-md"
        onClick={onClose}
      >
        Get Started
      </Link>
    </>
  );
}
