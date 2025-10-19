'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth.store';

export default function AuthButtons() {
  const { isAuthenticated, logout } = useAuthStore();

  if (isAuthenticated) {
    return (
      <>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 bg-white border-2 border-[#021f5c] text-[#021f5c] rounded-[25px] font-bold hover:bg-[#021f5c] hover:text-white transition-all uppercase text-sm"
        >
          Dashboard
        </Link>
        <button
          onClick={logout}
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
        className="px-5 py-2.5 bg-white border-2 border-[#021f5c] text-[#021f5c] rounded-[25px] font-bold hover:bg-[#021f5c] hover:text-white transition-all uppercase text-sm"
      >
        Sign In
      </Link>
      <Link
        href="/register"
        className="px-5 py-2.5 bg-[#fdca2e] text-[#021f5c] rounded-[25px] font-bold hover:bg-[#021f5c] hover:text-[#fdca2e] transition-all uppercase text-sm shadow-md"
      >
        Get Started
      </Link>
    </>
  );
}
