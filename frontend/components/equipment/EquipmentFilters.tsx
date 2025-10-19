'use client';

import { useState, useEffect } from 'react';
import { EquipmentFilters as IEquipmentFilters, Category } from '@/lib/types';
import { SOUTHWEST_STATES } from '@/lib/data/nigeria-southwest-locations';

interface EquipmentFiltersProps {
  filters: IEquipmentFilters;
  onFilterChange: (filters: IEquipmentFilters) => void;
  categories?: Category[];
}

export default function EquipmentFilters({
  filters,
  onFilterChange,
  categories = [],
}: EquipmentFiltersProps) {
  const [localFilters, setLocalFilters] = useState<IEquipmentFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (key: keyof IEquipmentFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };

  const handleResetFilters = () => {
    const resetFilters: IEquipmentFilters = { page: 1, limit: 20 };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-[#021f5c] mb-4">Filter Equipment</h2>

      {/* Search */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-[#021f5c] mb-2">
          Search
        </label>
        <input
          type="text"
          placeholder="Search by name or description..."
          value={localFilters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7A3E]"
        />
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-bold text-[#021f5c] mb-2">
            Category
          </label>
          <select
            value={localFilters.categoryId || ''}
            onChange={(e) => handleChange('categoryId', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7A3E]"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Location Filter */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-[#021f5c] mb-2">
          Location (State)
        </label>
        <select
          value={localFilters.locationState || ''}
          onChange={(e) => handleChange('locationState', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7A3E]"
        >
          <option value="">All States</option>
          {SOUTHWEST_STATES.map((state) => (
            <option key={state.code} value={state.name}>
              {state.name}
            </option>
          ))}
        </select>
      </div>

      {/* Condition Filter */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-[#021f5c] mb-2">
          Condition
        </label>
        <select
          value={localFilters.condition || ''}
          onChange={(e) => handleChange('condition', e.target.value as any)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7A3E]"
        >
          <option value="">All Conditions</option>
          <option value="EXCELLENT">Excellent</option>
          <option value="GOOD">Good</option>
          <option value="FAIR">Fair</option>
          <option value="POOR">Poor</option>
        </select>
      </div>

      {/* Farming Stage Filter */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-[#021f5c] mb-2">
          Farming Stage
        </label>
        <select
          value={localFilters.tags || ''}
          onChange={(e) => handleChange('tags', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7A3E]"
        >
          <option value="">All Stages</option>
          <option value="land_preparation">Land Preparation</option>
          <option value="planting">Planting</option>
          <option value="crop_management">Crop Management</option>
          <option value="harvesting">Harvesting</option>
          <option value="storage">Storage</option>
          <option value="post_harvest">Post-Harvest</option>
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-[#021f5c] mb-2">
          Price Range (per day)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={localFilters.minPrice || ''}
            onChange={(e) => handleChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7A3E]"
          />
          <input
            type="number"
            placeholder="Max"
            value={localFilters.maxPrice || ''}
            onChange={(e) => handleChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7A3E]"
          />
        </div>
      </div>

      {/* Availability */}
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={localFilters.isAvailable || false}
            onChange={(e) => handleChange('isAvailable', e.target.checked)}
            className="mr-2 w-4 h-4 text-[#2D7A3E] focus:ring-[#2D7A3E]"
          />
          <span className="text-sm font-semibold text-[#021f5c]">
            Available Only
          </span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleApplyFilters}
          className="flex-1 bg-[#2D7A3E] text-white py-2 px-4 rounded-lg font-bold hover:bg-[#245a31] transition-colors"
        >
          Apply Filters
        </button>
        <button
          onClick={handleResetFilters}
          className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-bold hover:bg-gray-300 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
