'use client';

import { useAuthStore } from '@/lib/store/auth.store';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/shared/Button';

export default function Home() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative text-white overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/hero_image.png)' }}
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 uppercase leading-tight">
              Rent Farm Equipment
              <span className="block mt-2 text-[#fdca2e]">Grow Your Business</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed">
              Connect with trusted equipment owners across Nigeria. Find tractors, harvesters,
              irrigation systems, and more to boost your farm productivity.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {isAuthenticated ? (
                <>
                  <Button href="/equipment" variant="primary" size="lg">
                    Browse Equipment
                  </Button>
                  <Button href="/dashboard" variant="outline" size="lg">
                    Go to Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <Button href="/register" variant="primary" size="lg">
                    Get Started Free
                  </Button>
                  <Button href="/login" variant="outline" size="lg">
                    Sign In
                  </Button>
                </>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 border-t border-white/20">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-[#fdca2e]">500+</div>
                  <div className="text-sm text-white/80 mt-1 font-semibold">Equipment Listed</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-[#fdca2e]">1,000+</div>
                  <div className="text-sm text-white/80 mt-1 font-semibold">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-[#fdca2e]">15+</div>
                  <div className="text-sm text-white/80 mt-1 font-semibold">States Covered</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-[#fdca2e]">24/7</div>
                  <div className="text-sm text-white/80 mt-1 font-semibold">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 lg:py-24 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#021f5c] mb-4 uppercase">
              Why Choose FMS?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your trusted partner for farm equipment rental across Nigeria
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="bg-white rounded-[12px] shadow-lg hover:shadow-xl transition-shadow p-8 md:p-10">
              <div className="w-16 h-16 bg-[#fdca2e] rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0">
                <svg className="w-8 h-8 text-[#021f5c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-extrabold mb-3 text-[#021f5c] uppercase text-center md:text-left">
                Find Equipment
              </h3>
              <p className="text-gray-600 leading-relaxed text-center md:text-left">
                Search through hundreds of verified farm equipment listings across all states in Nigeria. From tractors to harvesters, find exactly what you need.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-white rounded-[12px] shadow-lg hover:shadow-xl transition-shadow p-8 md:p-10">
              <div className="w-16 h-16 bg-[#2D7A3E] rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-extrabold mb-3 text-[#021f5c] uppercase text-center md:text-left">
                Book Online
              </h3>
              <p className="text-gray-600 leading-relaxed text-center md:text-left">
                Simple, secure booking with instant confirmation. Check availability, select your dates, and book equipment in just a few clicks.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-white rounded-[12px] shadow-lg hover:shadow-xl transition-shadow p-8 md:p-10">
              <div className="w-16 h-16 bg-[#F47920] rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-extrabold mb-3 text-[#021f5c] uppercase text-center md:text-left">
                Affordable Rates
              </h3>
              <p className="text-gray-600 leading-relaxed text-center md:text-left">
                Competitive daily and weekly rates with transparent pricing. No hidden fees, just fair prices for quality equipment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#021f5c] mb-4 uppercase">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Getting started is easy - just follow these simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-[#fdca2e] text-[#021f5c] rounded-full flex items-center justify-center text-3xl font-extrabold mx-auto mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-extrabold mb-3 text-[#021f5c] uppercase">
                Browse Equipment
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Search for the equipment you need by category, location, or price. Filter by availability and ratings.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-[#2D7A3E] text-white rounded-full flex items-center justify-center text-3xl font-extrabold mx-auto mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-extrabold mb-3 text-[#021f5c] uppercase">
                Book & Confirm
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Select your dates, submit a booking request, and get instant confirmation from the equipment owner.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-[#F47920] text-white rounded-full flex items-center justify-center text-3xl font-extrabold mx-auto mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-2xl font-extrabold mb-3 text-[#021f5c] uppercase">
                Use & Grow
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Pick up or have the equipment delivered, use it for your farm work, and grow your business efficiently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-br from-[#2D7A3E] to-[#7FBF7F] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 uppercase">
            Ready to Get Started?
          </h2>
          <p className="text-xl md:text-2xl mb-10 text-white/90">
            Join thousands of farmers and equipment owners across Nigeria
          </p>

          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button href="/register" variant="primary" size="lg">
                Create Free Account
              </Button>
              <Button href="/equipment" variant="outline" size="lg">
                Browse Equipment
              </Button>
            </div>
          )}

          {/* Trust Elements */}
          <div className="pt-8 border-t border-white/20">
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#fdca2e]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span className="font-semibold">Verified Equipment Owners</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#fdca2e]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span className="font-semibold">Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#fdca2e]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span className="font-semibold">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
