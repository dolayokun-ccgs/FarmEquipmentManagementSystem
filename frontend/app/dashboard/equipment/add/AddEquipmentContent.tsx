'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';
import { useEquipmentStore } from '@/lib/store/equipment.store';
import Button from '@/components/shared/Button';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AddEquipmentContent() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { createEquipment, isLoading } = useEquipmentStore();

  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

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

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const nigerianStates = [
    'Oyo', 'Ogun', 'Lagos', 'Osun', 'Ondo', 'Ekiti',
    // Add more states as needed
  ];

  const conditionOptions = ['EXCELLENT', 'GOOD', 'FAIR'];

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard/equipment/add');
      return;
    }

    if (user && user.role !== 'PLATFORM_OWNER' && user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/categories`);
        setCategories(response.data.data.categories || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [isAuthenticated, authLoading, user, router]);

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

    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      // Limit to 5 images max
      if (selectedFiles.length + fileArray.length > 5) {
        setSubmitError('Maximum 5 images allowed');
        return;
      }
      setSelectedFiles([...selectedFiles, ...fileArray]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (selectedFiles.length === 0) return;

    setUploadingImages(true);
    setSubmitError('');

    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();

      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      const response = await axios.post(`${API_URL}/upload/equipment`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      const newImages = response.data.data.images;
      setUploadedImages([...uploadedImages, ...newImages]);
      setSelectedFiles([]);
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
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
      // Use uploaded images instead of the text field
      const imagesArray = uploadedImages;

      // Parse specifications as JSON object
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

      await createEquipment(equipmentData);
      router.push('/dashboard/equipment');
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to create equipment');
    }
  };

  if (authLoading || loadingCategories) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center" suppressHydrationWarning>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D7A3E]"></div>
      </main>
    );
  }

  if (!user || (user.role !== 'PLATFORM_OWNER' && user.role !== 'ADMIN')) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center" suppressHydrationWarning>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700 mb-4">Access Denied</h1>
          <Button variant="primary" onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50" suppressHydrationWarning>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#021f5c] to-[#03296b] text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Add New Equipment</h1>
          <p className="text-lg opacity-90">List new equipment for farmers to rent</p>
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
                    placeholder="e.g., John Deere 5055E Utility Tractor"
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
                    placeholder="Provide detailed description of the equipment..."
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
                    placeholder="5000"
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
                    placeholder="12 Farm Road"
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
                    placeholder="Ibadan"
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
                    placeholder="7.3775"
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
                    placeholder="3.9470"
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
                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-bold text-[#021f5c] mb-2">
                    Equipment Images (Max 5)
                  </label>

                  {/* File Input */}
                  <div className="mb-4">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="image-upload"
                      disabled={uploadedImages.length + selectedFiles.length >= 5}
                    />
                    <label
                      htmlFor="image-upload"
                      className={`inline-block px-6 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        uploadedImages.length + selectedFiles.length >= 5
                          ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                          : 'border-[#2D7A3E] bg-green-50 hover:bg-green-100'
                      }`}
                    >
                      <span className="text-[#021f5c] font-semibold">
                        {uploadedImages.length + selectedFiles.length >= 5
                          ? '✓ Maximum images selected'
                          : '📁 Select Images'}
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Accepted formats: JPEG, JPG, PNG, WebP (Max 5MB per image)
                    </p>
                  </div>

                  {/* Selected Files Preview */}
                  {selectedFiles.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-[#021f5c]">
                          Selected Files ({selectedFiles.length})
                        </p>
                        <Button
                          type="button"
                          variant="primary"
                          onClick={uploadImages}
                          disabled={uploadingImages}
                          className="text-sm px-4 py-2"
                        >
                          {uploadingImages ? 'Uploading...' : '⬆ Upload Images'}
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="relative border rounded-lg p-2 bg-gray-50">
                            <div className="aspect-square bg-gray-200 rounded flex items-center justify-center mb-2">
                              <span className="text-4xl">📷</span>
                            </div>
                            <p className="text-xs text-gray-600 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Uploaded Images Preview */}
                  {uploadedImages.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-[#021f5c] mb-2">
                        Uploaded Images ({uploadedImages.length})
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {uploadedImages.map((imageUrl, index) => (
                          <div key={index} className="relative border rounded-lg p-2 bg-white">
                            <div className="aspect-square bg-gray-100 rounded overflow-hidden mb-2">
                              <img
                                src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${imageUrl}`}
                                alt={`Equipment ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <p className="text-xs text-green-600 font-semibold">✓ Uploaded</p>
                            <button
                              type="button"
                              onClick={() => removeUploadedImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                    placeholder='{"Engine": "55 HP", "Power Steering": "Yes", "4WD": "Standard"}'
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter specifications as a JSON object (key-value pairs)
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                {submitError}
              </div>
            )}

            {/* Actions */}
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
                {isLoading ? 'Creating...' : 'Create Equipment'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
