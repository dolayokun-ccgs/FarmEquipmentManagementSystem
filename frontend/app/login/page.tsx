'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth.store';
import { isValidEmail } from '@/lib/utils/validation';
import Header from '@/components/layout/Header';
import Button from '@/components/shared/Button';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear errors when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    clearError();
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await login(formData);
      router.push('/'); // Redirect to home after successful login
    } catch (err) {
      // Error is handled by store
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header />

      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full">
          {/* Login Card */}
          <div className="bg-white rounded-[12px] shadow-xl p-8 md:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#2D7A3E] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">FMS</span>
              </div>
              <h2 className="text-3xl font-extrabold text-[#021f5c] uppercase">
                Sign In
              </h2>
              <p className="mt-3 text-gray-600">
                Welcome back! Sign in to access your account
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  href="/register"
                  className="font-bold text-[#F47920] hover:text-[#FFB366] transition-colors"
                >
                  Create one now
                </Link>
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800 font-semibold">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-[#021f5c] mb-2 uppercase">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 border-2 ${
                    formErrors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-[8px] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#fdca2e] focus:border-[#fdca2e] transition-all`}
                  placeholder="farmer@example.com"
                />
                {formErrors.email && (
                  <p className="mt-2 text-sm text-red-600 font-semibold">{formErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-bold text-[#021f5c] mb-2 uppercase">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 border-2 ${
                    formErrors.password ? 'border-red-500' : 'border-gray-300'
                  } rounded-[8px] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#fdca2e] focus:border-[#fdca2e] transition-all`}
                  placeholder="Enter your password"
                />
                {formErrors.password && (
                  <p className="mt-2 text-sm text-red-600 font-semibold">{formErrors.password}</p>
                )}
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#2D7A3E] focus:ring-[#fdca2e] border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 font-semibold">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-bold text-[#F47920] hover:text-[#FFB366] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                variant="green"
                size="lg"
                fullWidth
                className="mt-6"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-bold uppercase">Or continue with</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center gap-3 py-3 px-4 border-2 border-gray-300 rounded-[25px] shadow-sm bg-white text-sm font-bold text-gray-700 hover:border-[#021f5c] hover:bg-gray-50 transition-all uppercase"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </button>

                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center gap-3 py-3 px-4 border-2 border-gray-300 rounded-[25px] shadow-sm bg-white text-sm font-bold text-gray-700 hover:border-[#021f5c] hover:bg-gray-50 transition-all uppercase"
                >
                  <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Sign in with Facebook
                </button>
              </div>
            </form>
          </div>

          {/* Back to Home Link */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm font-bold text-[#021f5c] hover:text-[#2D7A3E] transition-colors uppercase"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
