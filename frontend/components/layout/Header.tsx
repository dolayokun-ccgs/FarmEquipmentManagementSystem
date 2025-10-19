'use client';

import Link from 'next/link';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Import auth buttons and notifications without SSR to prevent hydration errors
const AuthButtons = dynamic(() => import('./AuthButtons'), { ssr: false });
const MobileAuthButtons = dynamic(() => import('./MobileAuthButtons'), { ssr: false });
const NotificationBell = dynamic(() => import('./NotificationBell'), { ssr: false });

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      {/* Top Bar - Contact Info */}
      <div className="bg-[#021f5c] text-white py-2 px-4 text-sm hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-6">
            <a href="tel:+2348001234567" className="hover:text-[#fdca2e] transition-colors">
              📞 +234 800 123 4567
            </a>
            <a href="mailto:support@fms.ng" className="hover:text-[#fdca2e] transition-colors">
              ✉️ support@fms.ng
            </a>
          </div>
          <div className="flex gap-4">
            <a href="https://wa.me/2348001234567" target="_blank" rel="noopener noreferrer" className="hover:text-[#fdca2e] transition-colors">
              WhatsApp
            </a>
            <span>|</span>
            <span>Lagos, Nigeria</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-12 h-12 bg-[#2D7A3E] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">FMS</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-[#021f5c] font-bold text-xl uppercase tracking-tight">
                  Farm Equipment
                </div>
                <div className="text-[#F47920] text-xs uppercase tracking-wider">
                  Management System
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/equipment"
                className="text-[#2C2C2C] font-semibold hover:text-[#2D7A3E] transition-colors uppercase text-sm"
              >
                Browse Equipment
              </Link>
              <Link
                href="/how-it-works"
                className="text-[#2C2C2C] font-semibold hover:text-[#2D7A3E] transition-colors uppercase text-sm"
              >
                How It Works
              </Link>
              <Link
                href="/about"
                className="text-[#2C2C2C] font-semibold hover:text-[#2D7A3E] transition-colors uppercase text-sm"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-[#2C2C2C] font-semibold hover:text-[#2D7A3E] transition-colors uppercase text-sm"
              >
                Contact
              </Link>
            </div>

            {/* Notifications & Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <NotificationBell />
              <AuthButtons />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col gap-4">
                <Link
                  href="/equipment"
                  className="text-[#2C2C2C] font-semibold hover:text-[#2D7A3E] transition-colors uppercase text-sm py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Equipment
                </Link>
                <Link
                  href="/how-it-works"
                  className="text-[#2C2C2C] font-semibold hover:text-[#2D7A3E] transition-colors uppercase text-sm py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </Link>
                <Link
                  href="/about"
                  className="text-[#2C2C2C] font-semibold hover:text-[#2D7A3E] transition-colors uppercase text-sm py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="text-[#2C2C2C] font-semibold hover:text-[#2D7A3E] transition-colors uppercase text-sm py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>

                <div className="border-t pt-4 flex flex-col gap-3">
                  <MobileAuthButtons onClose={() => setMobileMenuOpen(false)} />
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>
    </>
  );
}
