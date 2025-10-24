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
    tags: [] as string[],
  });

  const [specifications, setSpecifications] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const nigerianStates = ['Oyo', 'Ogun', 'Lagos', 'Osun', 'Ondo', 'Ekiti'];
  const conditionOptions = ['EXCELLENT', 'GOOD', 'FAIR'];

  const farmingStages = [
    { value: 'land_preparation', label: 'Land Preparation' },
    { value: 'planting', label: 'Planting' },
    { value: 'crop_management', label: 'Crop Management' },
    { value: 'harvesting', label: 'Harvesting' },
    { value: 'storage', label: 'Storage' },
    { value: 'post_harvest', label: 'Post-Harvest' },
  ];

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
        setCategories(response.data.data.categories || []);
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
      // Parse and load images
      let imagesArray: string[] = [];
      if (currentEquipment.images) {
        try {
          imagesArray = typeof currentEquipment.images === 'string'
            ? JSON.parse(currentEquipment.images)
            : currentEquipment.images;
        } catch {
          imagesArray = [];
        }
      }
      setUploadedImages(imagesArray);

      // Parse and load specifications
      let specificationsObj: Record<string, string> = {};
      if (currentEquipment.specifications) {
        try {
          specificationsObj = typeof currentEquipment.specifications === 'string'
            ? JSON.parse(currentEquipment.specifications)
            : currentEquipment.specifications;
        } catch {
          specificationsObj = {};
        }
      }
      setSpecifications(specificationsObj);

      // Parse and load tags
      let tagsArray: string[] = [];
      if ((currentEquipment as any).tags) {
        try {
          tagsArray = typeof (currentEquipment as any).tags === 'string'
            ? JSON.parse((currentEquipment as any).tags)
            : (currentEquipment as any).tags;
        } catch {
          tagsArray = [];
        }
      }

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
        tags: tagsArray,
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

  const toggleTag = (tagValue: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagValue)
        ? prev.tags.filter(t => t !== tagValue)
        : [...prev.tags, tagValue]
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      if (uploadedImages.length + selectedFiles.length + fileArray.length > 5) {
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

  const handleSpecificationChange = (key: string, value: string) => {
    setSpecifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const addSpecificationField = () => {
    const key = `spec_${Object.keys(specifications).length + 1}`;
    setSpecifications(prev => ({
      ...prev,
      [key]: ''
    }));
  };

  const removeSpecificationField = (key: string) => {
    const newSpecs = { ...specifications };
    delete newSpecs[key];
    setSpecifications(newSpecs);
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
      // Use uploaded images
      const imagesArray = uploadedImages;

      // Filter out empty specifications
      const filteredSpecs = Object.entries(specifications).reduce((acc, [key, value]) => {
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);

      const equipmentData = {
        ...formData,
        pricePerDay: Number(formData.pricePerDay),
        latitude: formData.latitude ? Number(formData.latitude) : undefined,
        longitude: formData.longitude ? Number(formData.longitude) : undefined,
        images: JSON.stringify(imagesArray),
        specifications: Object.keys(filteredSpecs).length > 0 ? JSON.stringify(filteredSpecs) : undefined,
        tags: formData.tags.length > 0 ? JSON.stringify(formData.tags) : undefined,
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
        <main className="min-h-screen bg-gray-50 flex items-center justify-center" suppressHydrationWarning>
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
        <main className="min-h-screen bg-gray-50 flex items-center justify-center" suppressHydrationWarning>
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
        <main className="min-h-screen bg-gray-50 flex items-center justify-center" suppressHydrationWarning>
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
      <main className="min-h-screen bg-gray-50" suppressHydrationWarning>
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

                  {/* Specifications Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-bold text-[#021f5c]">
                        Specifications
                      </label>
                      <Button
                        type="button"
                        variant="outline-dark"
                        onClick={addSpecificationField}
                        className="text-sm px-4 py-2"
                      >
                        + Add Specification
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      Add key specifications for this equipment (e.g., Engine, Power Steering, etc.)
                    </p>

                    {Object.keys(specifications).length === 0 ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <p className="text-gray-500 text-sm">No specifications added yet. Click "Add Specification" to start.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(specifications).map(([key, value]) => (
                          <div key={key} className="flex gap-3 items-start">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={key.startsWith('spec_') ? '' : key}
                                onChange={(e) => {
                                  const newKey = e.target.value;
                                  const newSpecs = { ...specifications };
                                  delete newSpecs[key];
                                  newSpecs[newKey] = value;
                                  setSpecifications(newSpecs);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7A3E]"
                                placeholder="Specification name (e.g., Engine)"
                              />
                            </div>
                            <div className="flex-1">
                              <input
                                type="text"
                                value={value}
                                onChange={(e) => handleSpecificationChange(key, e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7A3E]"
                                placeholder="Value (e.g., 55 HP)"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSpecificationField(key)}
                              className="mt-2 text-red-500 hover:text-red-700 font-bold"
                              title="Remove specification"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tags Section */}
                  <div>
                    <label className="block text-sm font-bold text-[#021f5c] mb-3">
                      Farming Stages
                    </label>
                    <p className="text-xs text-gray-600 mb-3">
                      Select the farming stages this equipment is suitable for
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {farmingStages.map((stage) => (
                        <button
                          key={stage.value}
                          type="button"
                          onClick={() => toggleTag(stage.value)}
                          className={`px-4 py-3 rounded-lg border-2 font-semibold text-sm transition-all ${
                            formData.tags.includes(stage.value)
                              ? 'border-[#2D7A3E] bg-green-50 text-[#2D7A3E]'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-[#2D7A3E] hover:bg-green-50'
                          }`}
                        >
                          <span className="mr-2">
                            {formData.tags.includes(stage.value) ? '✓' : '○'}
                          </span>
                          {stage.label}
                        </button>
                      ))}
                    </div>
                    {formData.tags.length > 0 && (
                      <p className="text-xs text-[#2D7A3E] mt-2 font-semibold">
                        {formData.tags.length} stage{formData.tags.length !== 1 ? 's' : ''} selected
                      </p>
                    )}
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
                  variant="outline-dark"
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
