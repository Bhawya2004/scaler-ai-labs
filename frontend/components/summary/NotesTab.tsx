'use client';

import React from 'react';
import { MessageSquare, Plus, Trash2, Tag, Calendar } from 'lucide-react';
import { Comment } from '@/lib/types';
import { formatMeetingDate } from '@/lib/utils';
import { api } from '@/lib/api';

interface NotesTabProps {
  comments: Comment[];
  onAddNote: () => void;
  onCommentsChange: (comments: Comment[]) => void;
}

const COLOR_BORDER: Record<string, string> = {
  purple: 'border-l-purple-500 bg-purple-50/40 dark:bg-purple-950/20',
  yellow: 'border-l-amber-400 bg-amber-50/40 dark:bg-amber-950/20',
  blue: 'border-l-sky-500 bg-sky-50/40 dark:bg-sky-950/20',
  green: 'border-l-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20',
  pink: 'border-l-pink-500 bg-pink-50/40 dark:bg-pink-950/20',
};

export function NotesTab({ comments, onAddNote, onCommentsChange }: NotesTabProps) {
  const handleDelete = async (id: string) => {
    const updated = comments.filter((c) => c.id !== id);
    onCommentsChange(updated);
    try {
      await api.deleteComment(id);
    } catch (err) {
      console.error('Failed to delete comment:', err);
      onCommentsChange(comments);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-surface-700 dark:text-surface-300">
            Notes & Highlights ({comments.length})
          </h4>
        </div>
        <button
          onClick={onAddNote}
          className="flex items-center gap-1 rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-700"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Note</span>
        </button>
      </div>

      {comments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-surface-200 p-8 text-center text-surface-400 dark:border-surface-800">
          <MessageSquare className="h-6 w-6 mx-auto mb-1.5 opacity-50" />
          <p className="text-xs font-semibold text-surface-600 dark:text-surface-400">
            No personal notes or highlights yet
          </p>
          <p className="text-[11px] mt-0.5">
            Click &ldquo;Add Note&rdquo; or click the note icon next to any transcript utterance.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {comments.map((comment) => {
            const borderStyle = COLOR_BORDER[comment.color_tag] || COLOR_BORDER.purple;
            return (
              <div
                key={comment.id}
                className={`group flex items-start justify-between gap-3 rounded-2xl border border-surface-200 border-l-4 p-4 transition-all hover:shadow-xs dark:border-surface-800 ${borderStyle}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[11px] text-surface-500 mb-1">
                    <span className="font-bold text-surface-800 dark:text-surface-200">
                      {comment.user_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatMeetingDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-surface-800 dark:text-surface-200">
                    {comment.content}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(comment.id)}
                  className="opacity-0 group-hover:opacity-100 rounded-lg p-1 text-surface-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
                  title="Delete Note"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
