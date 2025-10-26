'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGroupBookingStore } from '@/lib/store/groupBooking.store';
import { GroupBooking } from '@/lib/types';
import Button from '../shared/Button';

interface AvailableGroupBookingsProps {
  equipmentId: string;
  onJoin?: (groupBookingId: string) => void;
}

export default function AvailableGroupBookings({
  equipmentId,
  onJoin,
}: AvailableGroupBookingsProps) {
  const router = useRouter();
  const { availableGroupBookings, isLoading, fetchAvailableGroupBookings } =
    useGroupBookingStore();

  useEffect(() => {
    fetchAvailableGroupBookings(equipmentId);
  }, [equipmentId, fetchAvailableGroupBookings]);

  const handleViewDetails = (groupBookingId: string) => {
    router.push(`/group-bookings/${groupBookingId}`);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D7A3E]"></div>
        <p className="mt-2 text-gray-600">Loading available group bookings...</p>
      </div>
    );
  }

  if (availableGroupBookings.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <p className="mt-4 text-gray-600 font-medium">No open group bookings available</p>
        <p className="text-sm text-gray-500 mt-1">
          Be the first to create a group booking for this equipment!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold text-[#021f5c]">
          Available Group Bookings ({availableGroupBookings.length})
        </h4>
      </div>

      <div className="grid gap-4">
        {availableGroupBookings.map((groupBooking) => (
          <GroupBookingCard
            key={groupBooking.id}
            groupBooking={groupBooking}
            onViewDetails={handleViewDetails}
            onJoin={onJoin}
          />
        ))}
      </div>
    </div>
  );
}

interface GroupBookingCardProps {
  groupBooking: GroupBooking;
  onViewDetails: (id: string) => void;
  onJoin?: (id: string) => void;
}

function GroupBookingCard({ groupBooking, onViewDetails, onJoin }: GroupBookingCardProps) {
  const participantCount = groupBooking.participants?.length || 0;
  const spotsRemaining = groupBooking.maxParticipants - participantCount;
  const percentageFilled = (participantCount / groupBooking.maxParticipants) * 100;
  const costPerPerson =
    participantCount > 0
      ? Number(groupBooking.totalPrice) / participantCount
      : Number(groupBooking.totalPrice) / groupBooking.maxParticipants;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isExpired = groupBooking.expiresAt && new Date(groupBooking.expiresAt) < new Date();
  const isFull = participantCount >= groupBooking.maxParticipants;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full uppercase">
              {groupBooking.status}
            </span>
            {isExpired && (
              <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full uppercase">
                Expired
              </span>
            )}
            {isFull && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full uppercase">
                Full
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">
            {formatDate(groupBooking.startDate)} - {formatDate(groupBooking.endDate)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {groupBooking.totalDays} day{groupBooking.totalDays > 1 ? 's' : ''}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Cost per person</p>
          <p className="text-2xl font-extrabold text-[#2D7A3E]">
            NGN {costPerPerson.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-semibold text-gray-700">
            {participantCount} / {groupBooking.maxParticipants} participants
          </span>
          <span className="text-gray-600">{spotsRemaining} spot{spotsRemaining !== 1 ? 's' : ''} remaining</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-[#2D7A3E] h-3 rounded-full transition-all duration-300"
            style={{ width: `${percentageFilled}%` }}
          ></div>
        </div>
      </div>

      {/* Minimum Requirement */}
      {participantCount < groupBooking.minParticipants && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">
              {groupBooking.minParticipants - participantCount} more participant
              {groupBooking.minParticipants - participantCount > 1 ? 's' : ''} needed
            </span>{' '}
            to reach minimum requirement
          </p>
        </div>
      )}

      {/* Expiry Info */}
      {groupBooking.expiresAt && !isExpired && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Expires on {formatDate(groupBooking.expiresAt)}
          </p>
        </div>
      )}

      {/* Notes */}
      {groupBooking.notes && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 italic">
            {groupBooking.notes}
          </p>
        </div>
      )}

      {/* Initiator */}
      {groupBooking.initiator && (
        <div className="mb-4 text-sm text-gray-600">
          <span className="font-semibold">Created by:</span>{' '}
          {groupBooking.initiator.firstName} {groupBooking.initiator.lastName}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(groupBooking.id)}
          className="flex-1"
        >
          View Details
        </Button>
        {!isExpired && !isFull && onJoin && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onJoin(groupBooking.id)}
            className="flex-1"
          >
            Join Group
          </Button>
        )}
      </div>
    </div>
  );
}
