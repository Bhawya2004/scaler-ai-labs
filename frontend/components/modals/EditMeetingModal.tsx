'use client';

import React, { useState, useEffect } from 'react';
import { X, Edit2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { MeetingListItem, MeetingDetail } from '@/lib/types';

interface EditMeetingModalProps {
  isOpen: boolean;
  meeting: MeetingListItem | MeetingDetail | null;
  onClose: () => void;
  onSuccess: (updated: MeetingDetail) => void;
}

export function EditMeetingModal({ isOpen, meeting, onClose, onSuccess }: EditMeetingModalProps) {
  const [title, setTitle] = useState('');
  const [meetingType, setMeetingType] = useState('Product');
  const [participants, setParticipants] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (meeting) {
      setTitle(meeting.title);
      setMeetingType(meeting.meeting_type || 'General');
      setParticipants(
        Array.isArray(meeting.participants)
          ? meeting.participants.join(', ')
          : ''
      );
    }
  }, [meeting]);

  if (!isOpen || !meeting) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const participantList = participants
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      const updated = await api.updateMeeting(meeting.id, {
        title,
        meeting_type: meetingType,
        participants: participantList,
      });

      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update meeting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
      <div
        className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-2xl dark:border-surface-800 dark:bg-surface-900 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-surface-200 px-6 py-4 dark:border-surface-800">
          <div className="flex items-center gap-2">
            <Edit2 className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <h3 className="font-heading text-base font-bold text-surface-900 dark:text-white">
              Edit Meeting Metadata
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-surface-400 hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          {error && (
            <p className="rounded-xl bg-rose-50 p-2.5 text-xs font-medium text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
              {error}
            </p>
          )}

          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300">
              Meeting Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 h-9 w-full rounded-xl border border-surface-200 bg-white px-3 text-xs text-surface-900 focus:border-brand-500 focus:outline-hidden dark:border-surface-700 dark:bg-surface-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300">
              Category
            </label>
            <select
              value={meetingType}
              onChange={(e) => setMeetingType(e.target.value)}
              className="mt-1 h-9 w-full rounded-xl border border-surface-200 bg-white px-3 text-xs text-surface-900 focus:border-brand-500 focus:outline-hidden dark:border-surface-700 dark:bg-surface-800 dark:text-white"
            >
              <option value="Product">Product</option>
              <option value="Engineering">Engineering</option>
              <option value="Sales">Sales</option>
              <option value="Design">Design</option>
              <option value="Leadership">Leadership</option>
              <option value="General">General</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300">
              Participants (comma-separated)
            </label>
            <input
              type="text"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              className="mt-1 h-9 w-full rounded-xl border border-surface-200 bg-white px-3 text-xs text-surface-900 focus:border-brand-500 focus:outline-hidden dark:border-surface-700 dark:bg-surface-800 dark:text-white"
            />
          </div>

          <div className="mt-2 flex items-center justify-end gap-2 pt-2 border-t border-surface-100 dark:border-surface-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-surface-200 bg-white px-4 py-2 text-xs font-semibold text-surface-700 hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-brand-600/20 hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
