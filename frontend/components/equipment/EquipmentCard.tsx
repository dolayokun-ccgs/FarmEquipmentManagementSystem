'use client';

import Link from 'next/link';
import { Equipment } from '@/lib/types';

interface EquipmentCardProps {
  equipment: Equipment;
}

export default function EquipmentCard({ equipment }: EquipmentCardProps) {
  // Parse images if stored as JSON string
  const images = equipment.images
    ? typeof equipment.images === 'string'
      ? JSON.parse(equipment.images)
      : equipment.images
    : [];
  const imageUrl = images.length > 0 ? images[0] : '/placeholder-equipment.jpg';

  return (
    <Link href={`/equipment/${equipment.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer h-full">
        {/* Equipment Image */}
        <div className="relative h-48 bg-gray-200">
          <img
            src={imageUrl}
            alt={equipment.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-equipment.jpg';
            }}
          />
          {!equipment.isAvailable && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Not Available
            </div>
          )}
          {equipment.condition && (
            <div className="absolute top-2 left-2 bg-[#2D7A3E] text-white px-3 py-1 rounded-full text-sm font-semibold">
              {equipment.condition}
            </div>
          )}
        </div>

        {/* Equipment Info */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-[#021f5c] mb-2 line-clamp-1">
            {equipment.name}
          </h3>

          {equipment.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {equipment.description}
            </p>
          )}

          {/* Location */}
          {equipment.locationState && (
            <div className="flex items-center text-gray-500 text-sm mb-2">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>
                {equipment.locationCity && `${equipment.locationCity}, `}
                {equipment.locationState}
              </span>
            </div>
          )}

          {/* Category */}
          {equipment.category && (
            <div className="text-sm text-gray-500 mb-3">
              <span className="font-semibold">Category:</span> {equipment.category.name}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
            <div>
              <span className="text-2xl font-bold text-[#2D7A3E]">
                ₦{Number(equipment.pricePerDay).toLocaleString()}
              </span>
              <span className="text-gray-500 text-sm ml-1">/day</span>
            </div>
            <button className="bg-[#fdca2e] text-[#021f5c] px-4 py-2 rounded-lg font-bold hover:bg-[#e6b829] transition-colors">
              View Details
            </button>
          </div>

          {/* Government Provider Info */}
          {equipment.owner && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4 text-[#021f5c]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <p className="text-xs text-gray-700 font-medium">
                  Provided by{' '}
                  <span className="font-bold text-[#021f5c]">
                    {equipment.owner.firstName} {equipment.owner.lastName}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
