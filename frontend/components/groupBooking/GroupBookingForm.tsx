'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGroupBookingStore } from '@/lib/store/groupBooking.store';
import { CreateGroupBookingData, Equipment } from '@/lib/types';
import Button from '../shared/Button';

interface GroupBookingFormProps {
  equipment: Equipment;
  onSuccess?: (groupBookingId: string) => void;
  onCancel?: () => void;
}

export default function GroupBookingForm({
  equipment,
  onSuccess,
  onCancel,
}: GroupBookingFormProps) {
  const router = useRouter();
  const { createGroupBooking, isLoading, error } = useGroupBookingStore();

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    minParticipants: 2,
    maxParticipants: 5,
    isPublic: true,
    expiresAt: '',
    notes: '',
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Calculate estimated cost per person
  const calculateCostPerPerson = () => {
    if (!formData.startDate || !formData.endDate || formData.maxParticipants === 0) {
      return 0;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = Number(equipment.pricePerDay) * totalDays;
    return totalPrice / formData.maxParticipants;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!formData.startDate || !formData.endDate) {
      setFormError('Please select start and end dates');
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const now = new Date();

    if (start < now) {
      setFormError('Start date cannot be in the past');
      return;
    }

    if (end <= start) {
      setFormError('End date must be after start date');
      return;
    }

    if (formData.minParticipants < 2) {
      setFormError('Minimum participants must be at least 2');
      return;
    }

    if (formData.maxParticipants < formData.minParticipants) {
      setFormError('Maximum participants must be greater than or equal to minimum participants');
      return;
    }

    if (formData.expiresAt) {
      const expires = new Date(formData.expiresAt);
      if (expires < now) {
        setFormError('Expiry date cannot be in the past');
        return;
      }
      if (expires > start) {
        setFormError('Expiry date must be before the start date');
        return;
      }
    }

    try {
      const data: CreateGroupBookingData = {
        equipmentId: equipment.id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        minParticipants: formData.minParticipants,
        maxParticipants: formData.maxParticipants,
        isPublic: formData.isPublic,
        expiresAt: formData.expiresAt || undefined,
        notes: formData.notes || undefined,
      };

      const groupBooking = await createGroupBooking(data);

      if (onSuccess) {
        onSuccess(groupBooking.id);
      } else {
        router.push(`/group-bookings/${groupBooking.id}`);
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to create group booking');
    }
  };

  const costPerPerson = calculateCostPerPerson();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-[#021f5c] mb-4">
          Create Group Booking
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Share the rental cost with other farmers! Create a group booking and invite others to join.
        </p>
      </div>

      {/* Error Display */}
      {(formError || error) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {formError || error}
        </div>
      )}

      {/* Date Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D7A3E] focus:border-transparent"
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D7A3E] focus:border-transparent"
            required
            min={formData.startDate || new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {/* Participant Limits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Minimum Participants
          </label>
          <input
            type="number"
            value={formData.minParticipants}
            onChange={(e) =>
              setFormData({ ...formData, minParticipants: parseInt(e.target.value) })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D7A3E] focus:border-transparent"
            required
            min="2"
            max={formData.maxParticipants}
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum farmers needed to proceed
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Maximum Participants
          </label>
          <input
            type="number"
            value={formData.maxParticipants}
            onChange={(e) =>
              setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D7A3E] focus:border-transparent"
            required
            min={formData.minParticipants}
            max="20"
          />
          <p className="text-xs text-gray-500 mt-1">
            Maximum farmers allowed to join
          </p>
        </div>
      </div>

      {/* Cost Preview */}
      {costPerPerson > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Estimated cost per person:</p>
              <p className="text-2xl font-extrabold text-[#2D7A3E]">
                NGN {costPerPerson.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Based on {formData.maxParticipants} participants
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Cost:</p>
              <p className="text-lg font-bold text-gray-700">
                NGN {(costPerPerson * formData.maxParticipants).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Expiry Date (Optional) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Expiry Date (Optional)
        </label>
        <input
          type="date"
          value={formData.expiresAt}
          onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D7A3E] focus:border-transparent"
          min={new Date().toISOString().split('T')[0]}
          max={formData.startDate || undefined}
        />
        <p className="text-xs text-gray-500 mt-1">
          Group booking will close after this date if not filled
        </p>
      </div>

      {/* Public/Private Toggle */}
      <div>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isPublic}
            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
            className="w-5 h-5 text-[#2D7A3E] border-gray-300 rounded focus:ring-2 focus:ring-[#2D7A3E]"
          />
          <span className="text-sm font-semibold text-gray-700">
            Make this group booking public
          </span>
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-8">
          {formData.isPublic
            ? 'Other farmers can discover and join this group'
            : 'Only people with the link can join (coming soon)'}
        </p>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Notes (Optional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D7A3E] focus:border-transparent"
          rows={3}
          placeholder="Add any additional information or requirements..."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Group Booking'}
        </Button>
      </div>
    </form>
  );
}
