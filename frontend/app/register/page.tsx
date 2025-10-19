'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth.store';
import { UserRole } from '@/lib/types';
import { isValidEmail, validatePassword, isValidPhoneNumber } from '@/lib/utils/validation';
import Header from '@/components/layout/Header';
import Button from '@/components/shared/Button';
import { SOUTHWEST_STATES, getLGAsByStateCode } from '@/lib/data/nigeria-southwest-locations';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: UserRole.FARMER,
    state: '',
    lga: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [availableLGAs, setAvailableLGAs] = useState<Array<{ name: string; code: string }>>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Handle state selection - update LGAs
    if (name === 'state') {
      const lgas = getLGAsByStateCode(value);
      setAvailableLGAs(lgas);
      setFormData((prev) => ({ ...prev, [name]: value, lga: '' })); // Reset LGA when state changes
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear errors when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    clearError();
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.errors[0];
      }
    }

    // Confirm password
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Phone number validation (optional)
    if (formData.phoneNumber && !isValidPhoneNumber(formData.phoneNumber)) {
      errors.phoneNumber = 'Invalid phone number format';
    }

    // State validation
    if (!formData.state) {
      errors.state = 'Please select your state';
    }

    // LGA validation
    if (!formData.lga) {
      errors.lga = 'Please select your local government area';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      router.push('/'); // Redirect to home after successful registration
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header />

      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl w-full">
          {/* Registration Card */}
          <div className="bg-white rounded-[12px] shadow-xl p-8 md:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#2D7A3E] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">FMS</span>
              </div>
              <h2 className="text-3xl font-extrabold text-[#021f5c] uppercase">
                Farmer Registration
              </h2>
              <p className="mt-3 text-gray-600">
                Register to access farm equipment in your Local Government Area
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-bold text-[#F47920] hover:text-[#FFB366] transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800 font-semibold">{error}</p>
              </div>
            )}

            {/* Registration Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Info Banner */}
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700 font-semibold">
                      Farm equipment is provided by your Local Government and State Government.
                      After registration, your account will be verified by your LGA.
                    </p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-[#021f5c] mb-2 uppercase">
                  Email Address *
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

              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-bold text-[#021f5c] mb-2 uppercase">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border-2 border-gray-300 rounded-[8px] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#fdca2e] focus:border-[#fdca2e] transition-all"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-bold text-[#021f5c] mb-2 uppercase">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border-2 border-gray-300 rounded-[8px] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#fdca2e] focus:border-[#fdca2e] transition-all"
                    placeholder="Farmer"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-bold text-[#021f5c] mb-2 uppercase">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 border-2 ${
                    formErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                  } rounded-[8px] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#fdca2e] focus:border-[#fdca2e] transition-all`}
                  placeholder="+234 800 123 4567"
                />
                {formErrors.phoneNumber && (
                  <p className="mt-2 text-sm text-red-600 font-semibold">{formErrors.phoneNumber}</p>
                )}
              </div>

              {/* State & LGA Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* State Selection */}
                <div>
                  <label htmlFor="state" className="block text-sm font-bold text-[#021f5c] mb-2 uppercase">
                    State *
                  </label>
                  <select
                    id="state"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    className={`block w-full px-4 py-3 border-2 ${
                      formErrors.state ? 'border-red-500' : 'border-gray-300'
                    } rounded-[8px] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#fdca2e] focus:border-[#fdca2e] transition-all font-semibold`}
                  >
                    <option value="">Select State</option>
                    {SOUTHWEST_STATES.map((state) => (
                      <option key={state.code} value={state.code}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.state && (
                    <p className="mt-2 text-sm text-red-600 font-semibold">{formErrors.state}</p>
                  )}
                </div>

                {/* LGA Selection */}
                <div>
                  <label htmlFor="lga" className="block text-sm font-bold text-[#021f5c] mb-2 uppercase">
                    Local Government *
                  </label>
                  <select
                    id="lga"
                    name="lga"
                    required
                    value={formData.lga}
                    onChange={handleChange}
                    disabled={!formData.state || availableLGAs.length === 0}
                    className={`block w-full px-4 py-3 border-2 ${
                      formErrors.lga ? 'border-red-500' : 'border-gray-300'
                    } rounded-[8px] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#fdca2e] focus:border-[#fdca2e] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <option value="">
                      {formData.state ? 'Select Local Government' : 'Select State First'}
                    </option>
                    {availableLGAs.map((lga) => (
                      <option key={lga.code} value={lga.code}>
                        {lga.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.lga && (
                    <p className="mt-2 text-sm text-red-600 font-semibold">{formErrors.lga}</p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-bold text-[#021f5c] mb-2 uppercase">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 border-2 ${
                    formErrors.password ? 'border-red-500' : 'border-gray-300'
                  } rounded-[8px] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#fdca2e] focus:border-[#fdca2e] transition-all`}
                  placeholder="Create a strong password"
                />
                {formErrors.password && (
                  <p className="mt-2 text-sm text-red-600 font-semibold">{formErrors.password}</p>
                )}
                <p className="mt-2 text-xs text-gray-500 font-semibold">
                  Must be at least 8 characters with uppercase, lowercase, number, and special character
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-bold text-[#021f5c] mb-2 uppercase">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 border-2 ${
                    formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  } rounded-[8px] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#fdca2e] focus:border-[#fdca2e] transition-all`}
                  placeholder="Re-enter your password"
                />
                {formErrors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 font-semibold">{formErrors.confirmPassword}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start pt-2">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 mt-1 text-[#2D7A3E] focus:ring-[#fdca2e] border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-3 block text-sm text-gray-700 font-semibold">
                  I agree to the{' '}
                  <Link href="/terms" className="text-[#F47920] hover:text-[#FFB366] transition-colors">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-[#F47920] hover:text-[#FFB366] transition-colors">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                variant="primary"
                size="lg"
                fullWidth
                className="mt-6"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-bold uppercase">Or sign up with</span>
                </div>
              </div>

              {/* Social Sign Up Buttons */}
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
                  Sign up with Google
                </button>

                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center gap-3 py-3 px-4 border-2 border-gray-300 rounded-[25px] shadow-sm bg-white text-sm font-bold text-gray-700 hover:border-[#021f5c] hover:bg-gray-50 transition-all uppercase"
                >
                  <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Sign up with Facebook
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
