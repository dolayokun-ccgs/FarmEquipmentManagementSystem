import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/shared/Button';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#021f5c] to-[#03296b] text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About FEMS</h1>
            <p className="text-lg md:text-xl opacity-90 max-w-3xl">
              Nigeria's leading farm equipment rental platform, making modern agricultural tools accessible to every farmer
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          {/* Introduction Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                  <span className="text-5xl">🌾</span>
                </div>
                <h2 className="text-3xl font-bold text-[#021f5c] mb-4">
                  Empowering Nigerian Farmers
                </h2>
              </div>

              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                <strong>FEMS</strong> is Nigeria's leading farm equipment rental platform, making modern agricultural
                tools accessible to every farmer — without the high cost of ownership.
              </p>

              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                We connect farmers to verified equipment owners who rent out tractors, tillers, planters, harvesters,
                irrigation kits, and more — helping small and medium-scale farmers save time, cut costs, and boost productivity.
              </p>

              <p className="text-lg text-gray-700 leading-relaxed">
                Our mission is to bridge the gap between technology and traditional farming, empowering communities
                through affordable mechanization and shared access.
              </p>
            </div>
          </div>

          {/* What We Offer Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-[#021f5c] text-center mb-12">
              What We Offer
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* For Farmers */}
              <div className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-lg transition-shadow">
                <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                  <svg className="w-12 h-12 text-[#2D7A3E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#021f5c] mb-4">For Farmers</h3>
                <p className="text-gray-600 leading-relaxed">
                  Access modern farming equipment at affordable rates. Rent by the day, week, or season.
                  No maintenance costs, no storage hassles.
                </p>
              </div>

              {/* For Equipment Owners */}
              <div className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-lg transition-shadow">
                <div className="inline-block p-4 bg-yellow-100 rounded-full mb-4">
                  <svg className="w-12 h-12 text-[#fdca2e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#021f5c] mb-4">For Equipment Owners</h3>
                <p className="text-gray-600 leading-relaxed">
                  Turn your idle equipment into income. List your machines, set your rates,
                  and earn from verified renters across Nigeria.
                </p>
              </div>

              {/* Verified Platform */}
              <div className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-lg transition-shadow">
                <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
                  <svg className="w-12 h-12 text-[#021f5c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#021f5c] mb-4">Verified & Trusted</h3>
                <p className="text-gray-600 leading-relaxed">
                  All equipment owners and renters are verified. Secure payments, transparent pricing,
                  and dedicated support.
                </p>
              </div>
            </div>
          </div>

          {/* Our Mission Section */}
          <div className="bg-gradient-to-r from-[#2D7A3E] to-[#3a8f4d] text-white rounded-lg shadow-lg p-8 md:p-12 mb-16">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-xl leading-relaxed mb-8">
                To bridge the gap between technology and traditional farming, empowering communities
                through affordable mechanization and shared access.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                  <span className="font-semibold">🚜 Modern Equipment</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                  <span className="font-semibold">💰 Affordable Access</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                  <span className="font-semibold">🌱 Sustainable Farming</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                  <span className="font-semibold">🤝 Community Growth</span>
                </div>
              </div>
            </div>
          </div>

          {/* Who We Serve Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-[#021f5c] text-center mb-8">
              Who We Serve
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#2D7A3E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#021f5c] mb-2">Farmers</h3>
                    <p className="text-gray-600">
                      Whether you're preparing land, planting, or harvesting, FEMS is your trusted partner
                      for smarter, faster, and more profitable farming.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#fdca2e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#021f5c] mb-2">Equipment Owners</h3>
                    <p className="text-gray-600">
                      If you're an equipment owner looking to earn from your idle machines, FEMS provides
                      a secure platform to connect with verified renters.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-[#021f5c] mb-4">
              Ready to Transform Your Farming?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of farmers and equipment owners across Nigeria
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                href="/equipment"
                variant="primary"
                size="lg"
              >
                Browse Equipment
              </Button>
              <Button
                href="/contact"
                variant="outline-dark"
                size="lg"
              >
                Contact Us
              </Button>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-2xl font-bold text-[#2D7A3E]">
                Rent. Farm. Grow. 🌾
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
