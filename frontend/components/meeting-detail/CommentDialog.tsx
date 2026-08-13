'use client';

import React, { useState } from 'react';
import { X, MessageSquare, Tag, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Comment } from '@/lib/types';

interface CommentDialogProps {
  isOpen: boolean;
  meetingId: string;
  segmentId?: string | null;
  onClose: () => void;
  onSuccess: (comment: Comment) => void;
}

const COLOR_TAGS: ('purple' | 'yellow' | 'blue' | 'green' | 'pink')[] = [
  'purple',
  'yellow',
  'blue',
  'green',
  'pink',
];

export function CommentDialog({
  isOpen,
  meetingId,
  segmentId,
  onClose,
  onSuccess,
}: CommentDialogProps) {
  const [content, setContent] = useState('');
  const [userName, setUserName] = useState('Bhawya');
  const [colorTag, setColorTag] = useState<'purple' | 'yellow' | 'blue' | 'green' | 'pink'>('purple');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const comment = await api.addComment(
        meetingId,
        content,
        userName,
        segmentId,
        colorTag
      );
      onSuccess(comment);
      setContent('');
      onClose();
    } catch (err) {
      console.error('Failed to add comment:', err);
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
            <MessageSquare className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <h3 className="font-heading text-base font-bold text-surface-900 dark:text-white">
              Add Note & Highlight
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
          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300">
              Your Note / Highlight
            </label>
            <textarea
              required
              rows={3}
              placeholder="Add your note, key insight, or question here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 w-full rounded-xl border border-surface-200 bg-white p-3 text-xs text-surface-900 focus:border-brand-500 focus:outline-hidden dark:border-surface-700 dark:bg-surface-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
              Highlight Color Tag
            </label>
            <div className="flex items-center gap-2">
              {COLOR_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setColorTag(tag)}
                  className={`h-7 w-7 rounded-full border-2 transition-transform ${
                    colorTag === tag ? 'scale-110 border-surface-900 dark:border-white' : 'border-transparent'
                  } ${
                    tag === 'purple' ? 'bg-purple-500' :
                    tag === 'yellow' ? 'bg-amber-400' :
                    tag === 'blue' ? 'bg-sky-500' :
                    tag === 'green' ? 'bg-emerald-500' : 'bg-pink-500'
                  }`}
                />
              ))}
            </div>
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
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
