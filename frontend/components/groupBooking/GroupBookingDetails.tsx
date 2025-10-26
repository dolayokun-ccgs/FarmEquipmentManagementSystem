'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGroupBookingStore } from '@/lib/store/groupBooking.store';
import { useAuthStore } from '@/lib/store/auth.store';
import { GroupBooking, GroupParticipant, PaymentStatus } from '@/lib/types';
import Button from '../shared/Button';

interface GroupBookingDetailsProps {
  groupBookingId: string;
}

export default function GroupBookingDetails({ groupBookingId }: GroupBookingDetailsProps) {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const {
    currentGroupBooking,
    isLoading,
    fetchGroupBookingById,
    joinGroupBooking,
    leaveGroupBooking,
  } = useGroupBookingStore();

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinNotes, setJoinNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchGroupBookingById(groupBookingId);
  }, [groupBookingId, fetchGroupBookingById]);

  if (isLoading || !currentGroupBooking) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D7A3E]"></div>
        <p className="mt-4 text-gray-600">Loading group booking details...</p>
      </div>
    );
  }

  const groupBooking = currentGroupBooking;
  const participants = groupBooking.participants || [];
  const participantCount = participants.length;
  const spotsRemaining = groupBooking.maxParticipants - participantCount;
  const percentageFilled = (participantCount / groupBooking.maxParticipants) * 100;

  const isParticipant = participants.some((p) => p.farmerId === user?.id);
  const currentUserParticipant = participants.find((p) => p.farmerId === user?.id);
  const isInitiator = groupBooking.initiatorId === user?.id;
  const isFull = participantCount >= groupBooking.maxParticipants;
  const isExpired = groupBooking.expiresAt && new Date(groupBooking.expiresAt) < new Date();

  const allPaid = participants.every((p) => p.paymentStatus === PaymentStatus.PAID);
  const minMet = participantCount >= groupBooking.minParticipants;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleJoin = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setActionLoading(true);
    try {
      await joinGroupBooking(groupBookingId, { notes: joinNotes || undefined });
      setShowJoinModal(false);
      setJoinNotes('');
    } catch (error) {
      console.error('Failed to join group booking:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this group booking?')) {
      return;
    }

    setActionLoading(true);
    try {
      await leaveGroupBooking(groupBookingId);
    } catch (error) {
      console.error('Failed to leave group booking:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!user || !token || !currentUserParticipant) return;

    try {
      const { groupBookingService } = await import('@/lib/services/groupBooking.service');
      const paymentData = await groupBookingService.initializePayment(
        groupBookingId,
        user.email,
        token
      );

      // Redirect to Paystack
      window.location.href = paymentData.authorization_url;
    } catch (error) {
      console.error('Failed to initialize payment:', error);
      alert('Failed to initialize payment. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#021f5c] to-[#2D7A3E] text-white rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-extrabold mb-2">Group Booking</h2>
            <p className="text-white/90">{groupBooking.equipment?.name}</p>
          </div>
          <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold uppercase">
            {groupBooking.status}
          </span>
        </div>
      </div>

      {/* Dates & Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Start Date</p>
          <p className="font-bold text-gray-900">{formatDate(groupBooking.startDate)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">End Date</p>
          <p className="font-bold text-gray-900">{formatDate(groupBooking.endDate)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Days</p>
          <p className="font-bold text-gray-900">{groupBooking.totalDays} days</p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Group Status</h3>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold">
              {participantCount} / {groupBooking.maxParticipants} Participants
            </span>
            <span className="text-gray-600">
              {spotsRemaining} spot{spotsRemaining !== 1 ? 's' : ''} remaining
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-[#2D7A3E] h-4 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
              style={{ width: `${percentageFilled}%` }}
            >
              {percentageFilled > 20 && (
                <span className="text-xs font-bold text-white">{Math.round(percentageFilled)}%</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-sm text-gray-600">Minimum Required</p>
            <p className="text-lg font-bold text-gray-900">{groupBooking.minParticipants} farmers</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Cost Per Person</p>
            <p className="text-lg font-bold text-[#2D7A3E]">
              NGN {(Number(groupBooking.totalPrice) / (participantCount || groupBooking.maxParticipants)).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {minMet && allPaid && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-semibold">
              ✓ Minimum requirement met and all participants paid!
            </p>
          </div>
        )}

        {minMet && !allPaid && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-semibold">
              Waiting for all participants to complete payment
            </p>
          </div>
        )}

        {!minMet && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 font-semibold">
              {groupBooking.minParticipants - participantCount} more participant{groupBooking.minParticipants - participantCount > 1 ? 's' : ''} needed
            </p>
          </div>
        )}
      </div>

      {/* Participants List */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Participants ({participantCount})
        </h3>

        {participants.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No participants yet. Be the first to join!</p>
        ) : (
          <div className="space-y-3">
            {participants.map((participant) => (
              <ParticipantCard key={participant.id} participant={participant} />
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      {groupBooking.notes && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Notes</h3>
          <p className="text-gray-700">{groupBooking.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {!user ? (
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push('/login')}
            className="w-full"
          >
            Login to Join This Group
          </Button>
        ) : isParticipant ? (
          <div className="space-y-4">
            {currentUserParticipant?.paymentStatus === PaymentStatus.PENDING && (
              <Button
                variant="primary"
                size="lg"
                onClick={handlePayment}
                className="w-full"
              >
                Pay Your Share (NGN {currentUserParticipant.shareAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })})
              </Button>
            )}

            {currentUserParticipant?.paymentStatus === PaymentStatus.PAID && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-green-800 font-semibold">✓ Payment Complete</p>
                <p className="text-sm text-green-700 mt-1">
                  You paid NGN {currentUserParticipant.shareAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}

            {currentUserParticipant?.paymentStatus === PaymentStatus.PENDING &&
              groupBooking.status === 'OPEN' && (
                <Button
                  variant="outline"
                  onClick={handleLeave}
                  disabled={actionLoading}
                  className="w-full"
                >
                  Leave Group
                </Button>
              )}
          </div>
        ) : !isFull && !isExpired && groupBooking.status === 'OPEN' ? (
          <Button
            variant="primary"
            size="lg"
            onClick={() => setShowJoinModal(true)}
            className="w-full"
          >
            Join This Group
          </Button>
        ) : (
          <div className="text-center py-4 text-gray-500">
            {isFull ? 'This group is full' : isExpired ? 'This group booking has expired' : 'This group is not accepting new members'}
          </div>
        )}
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Join Group Booking</h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                You'll be joining this group and your share will be:
              </p>
              <p className="text-2xl font-extrabold text-[#2D7A3E]">
                NGN {(Number(groupBooking.totalPrice) / (participantCount + 1)).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={joinNotes}
                onChange={(e) => setJoinNotes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D7A3E] focus:border-transparent"
                rows={3}
                placeholder="Any message to the group..."
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowJoinModal(false)}
                disabled={actionLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleJoin}
                disabled={actionLoading}
                className="flex-1"
              >
                {actionLoading ? 'Joining...' : 'Confirm & Join'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ParticipantCard({ participant }: { participant: GroupParticipant }) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#2D7A3E] rounded-full flex items-center justify-center text-white font-bold">
          {participant.farmer?.firstName?.charAt(0) || 'F'}
        </div>
        <div>
          <p className="font-semibold text-gray-900">
            {participant.farmer?.firstName} {participant.farmer?.lastName}
          </p>
          <p className="text-sm text-gray-600">
            Joined {new Date(participant.joinedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-sm font-semibold text-gray-700">
          NGN {participant.shareAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </p>
        <span
          className={`text-xs px-2 py-1 rounded-full font-semibold ${
            participant.paymentStatus === PaymentStatus.PAID
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {participant.paymentStatus === PaymentStatus.PAID ? 'Paid' : 'Pending'}
        </span>
      </div>
    </div>
  );
}
