'use client';

import React, { useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { api } from '@/lib/api';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  meetingId: string | null;
  meetingTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  meetingId,
  meetingTitle,
  onClose,
  onSuccess,
}: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !meetingId) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.deleteMeeting(meetingId);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
      <div
        className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-surface-200 bg-white p-6 shadow-2xl dark:border-surface-800 dark:bg-surface-900 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
          <AlertTriangle className="h-6 w-6" />
        </div>

        <h3 className="mt-4 font-heading text-lg font-bold text-surface-900 dark:text-white">
          Delete Meeting?
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-surface-500">
          Are you sure you want to delete <strong className="text-surface-800 dark:text-surface-200">&ldquo;{meetingTitle}&rdquo;</strong>? This action permanently removes all transcripts, AI summaries, chapters, and action items.
        </p>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-surface-200 bg-white px-4 py-2 text-xs font-semibold text-surface-700 hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete Meeting'}
          </button>
        </div>
      </div>
    </div>
  );
}
