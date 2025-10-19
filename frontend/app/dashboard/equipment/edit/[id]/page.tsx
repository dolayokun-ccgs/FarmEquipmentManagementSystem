'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';
import { useEquipmentStore } from '@/lib/store/equipment.store';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/shared/Button';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function EditEquipmentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { currentEquipment, isLoading, fetchEquipmentById, updateEquipment, clearCurrentEquipment } = useEquipmentStore();

  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    pricePerDay: '',
    condition: 'GOOD',
    locationAddress: '',
    locationCity: '',
    locationState: '',
    locationCountry: 'Nigeria',
    latitude: '',
    longitude: '',
    isAvailable: true,
    images: '',
    specifications: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const nigerianStates = ['Oyo', 'Ogun', 'Lagos', 'Osun', 'Ondo', 'Ekiti'];
  const conditionOptions = ['EXCELLENT', 'GOOD', 'FAIR'];

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard/equipment');
      return;
    }

    if (id) {
      fetchEquipmentById(id);
    }

    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/categories`);
        setCategories(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();

    return () => clearCurrentEquipment();
  }, [id, isAuthenticated, authLoading, router, fetchEquipmentById, clearCurrentEquipment]);

  // Load equipment data into form
  useEffect(() => {
    if (currentEquipment && !dataLoaded) {
      const images = currentEquipment.images
        ? typeof currentEquipment.images === 'string'
          ? currentEquipment.images
          : JSON.stringify(currentEquipment.images)
        : '';

      const specifications = currentEquipment.specifications
        ? typeof currentEquipment.specifications === 'string'
          ? currentEquipment.specifications
          : JSON.stringify(currentEquipment.specifications, null, 2)
        : '';

      setFormData({
        name: currentEquipment.name || '',
        description: currentEquipment.description || '',
        categoryId: currentEquipment.categoryId || '',
        pricePerDay: currentEquipment.pricePerDay?.toString() || '',
        condition: currentEquipment.condition || 'GOOD',
        locationAddress: currentEquipment.locationAddress || '',
        locationCity: currentEquipment.locationCity || '',
        locationState: currentEquipment.locationState || '',
        locationCountry: currentEquipment.locationCountry || 'Nigeria',
        latitude: currentEquipment.latitude?.toString() || '',
        longitude: currentEquipment.longitude?.toString() || '',
        isAvailable: currentEquipment.isAvailable ?? true,
        images,
        specifications,
      });
      setDataLoaded(true);
    }
  }, [currentEquipment, dataLoaded]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Equipment name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.pricePerDay || Number(formData.pricePerDay) <= 0) {
      newErrors.pricePerDay = 'Valid price per day is required';
    }
    if (!formData.locationCity.trim()) newErrors.locationCity = 'City is required';
    if (!formData.locationState) newErrors.locationState = 'State is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      setSubmitError('Please fix the errors above');
      return;
    }

    try {
      let imagesArray: string[] = [];
      if (formData.images.trim()) {
        try {
          imagesArray = JSON.parse(formData.images);
        } catch {
          imagesArray = formData.images.split(',').map(img => img.trim()).filter(img => img);
        }
      }

      let specificationsObj: Record<string, any> = {};
      if (formData.specifications.trim()) {
        try {
          specificationsObj = JSON.parse(formData.specifications);
        } catch (error) {
          setSubmitError('Specifications must be valid JSON format');
          return;
        }
      }

      const equipmentData = {
        ...formData,
        pricePerDay: Number(formData.pricePerDay),
        latitude: formData.latitude ? Number(formData.latitude) : undefined,
        longitude: formData.longitude ? Number(formData.longitude) : undefined,
        images: JSON.stringify(imagesArray),
        specifications: Object.keys(specificationsObj).length > 0 ? JSON.stringify(specificationsObj) : undefined,
      };

      await updateEquipment(id, equipmentData);
      router.push('/dashboard/equipment');
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to update equipment');
    }
  };

  if (authLoading || loadingCategories || isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D7A3E]"></div>
        </main>
        <Footer />
      </>
    );
  }

  if (!user || (user.role !== 'PLATFORM_OWNER' && user.role !== 'ADMIN')) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-700 mb-4">Access Denied</h1>
            <Button variant="primary" onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!currentEquipment) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-700 mb-4">Equipment Not Found</h1>
            <Button variant="primary" onClick={() => router.push('/dashboard/equipment')}>
              Back to My Equipment
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#021f5c] to-[#03296b] text-white py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-2">Edit Equipment</h1>
            <p className="text-lg opacity-90">Update equipment details</p>
          </div>
        </div>

        {/* Form */}
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white rounded-lg shadow-md p-8">
            <form onSubmit={handleSubmit}>
              {/* Basic Information */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-[#021f5c] mb-4 border-b-2 border-[#fdca2e] pb-2">
                  Basic Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-[#021f5c] mb-2">
                      Equipment Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7A3E] ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-[#021f5c] mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7A3E] ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#021f5c] mb-2">
                      Category *
                    </label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7A3E] ${
                        errors.categoryId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#021f5c] mb-2">
                      Condition *
                    </label>
                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7A3E]"
                    >
                      {conditionOptions.map((condition) => (
                        <option key={condition} value={condition}>
                          {condition}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#021f5c] mb-2">
                      Price Per Day (₦) *
                    </label>
                    <input
                      type="number"
                      name="pricePerDay"
                      value={formData.pricePerDay}
                      onChange={handleChange}
                      min="0"
                      step="100"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7A3E] ${
                        errors.pricePerDay ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.pricePerDay && <p className="text-red-500 text-xs mt-1">{errors.pricePerDay}</p>}
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={formData.isAvailable}
                      onChange={handleChange}
                      className="w-5 h-5 text-[#2D7A3E] border-gray-300 rounded focus:ring-[#2D7A3E]"
                    />
                    <label className="ml-2 text-sm font-bold text-[#021f5c]">
                      Available for booking
                    </label>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-[#021f5c] mb-4 border-b-2 border-[#fdca2e] pb-2">
                  Location
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-[#021f5c] mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      name="locationAddress"
                      value={formData.locationAddress}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7A3E]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#021f5c] mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="locationCity"
                      value={formData.locationCity}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7A3E] ${
                        errors.locationCity ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.locationCity && <p className="text-red-500 text-xs mt-1">{errors.locationCity}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#021f5c] mb-2">
                      State *
                    </label>
                    <select
                      name="locationState"
                      value={formData.locationState}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7A3E] ${
                        errors.locationState ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a state</option>
                      {nigerianStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                    {errors.locationState && <p className="text-red-500 text-xs mt-1">{errors.locationState}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#021f5c] mb-2">
                      Latitude (Optional)
                    </label>
                    <input
                      type="text"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7A3E]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#021f5c] mb-2">
                      Longitude (Optional)
                    </label>
                    <input
                      type="text"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7A3E]"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-[#021f5c] mb-4 border-b-2 border-[#fdca2e] pb-2">
                  Additional Information
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-[#021f5c] mb-2">
                      Images (JSON Array or comma-separated URLs)
                    </label>
                    <textarea
                      name="images"
                      value={formData.images}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7A3E] font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#021f5c] mb-2">
                      Specifications (JSON Object)
                    </label>
                    <textarea
                      name="specifications"
                      value={formData.specifications}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7A3E] font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                  {submitError}
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/equipment')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Updating...' : 'Update Equipment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
