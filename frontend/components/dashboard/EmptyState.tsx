'use client';

import React from 'react';
import { SearchX, Mic, Plus, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  isSearch: boolean;
  onClearFilters?: () => void;
  onNewMeeting?: () => void;
  onLoadDemo?: () => void;
}

export function EmptyState({ isSearch, onClearFilters, onNewMeeting, onLoadDemo }: EmptyStateProps) {
  if (isSearch) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-300 bg-white/50 p-12 text-center dark:border-surface-700 dark:bg-surface-900/30">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-100 text-surface-400 dark:bg-surface-800 dark:text-surface-500">
          <SearchX className="h-7 w-7" />
        </div>
        <h3 className="mt-4 font-heading text-lg font-bold text-surface-900 dark:text-white">
          No matching meetings found
        </h3>
        <p className="mt-1 max-w-sm text-xs text-surface-500">
          We couldn&apos;t find any meetings matching your current search or category filter.
        </p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="mt-5 flex items-center gap-2 rounded-xl border border-surface-300 bg-white px-4 py-2 text-xs font-semibold text-surface-700 shadow-xs hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-200"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-brand-50/30 p-12 text-center dark:border-brand-900/40 dark:bg-brand-950/20">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
        <Mic className="h-7 w-7" />
      </div>
      <h3 className="mt-4 font-heading text-lg font-bold text-surface-900 dark:text-white">
        Your Meeting Workspace is Clean
      </h3>
      <p className="mt-1 max-w-sm text-xs text-surface-500">
        Upload your first transcript file (.txt, .vtt, .srt, .json), paste raw meeting notes, or explore with a sample meeting.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onNewMeeting && (
          <button
            onClick={onNewMeeting}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-600/20 transition-all hover:bg-brand-700 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Upload First Meeting</span>
          </button>
        )}
        {onLoadDemo && (
          <button
            onClick={onLoadDemo}
            className="flex items-center gap-2 rounded-xl border border-brand-300 bg-white px-4 py-2.5 text-xs font-semibold text-brand-700 shadow-xs hover:bg-brand-50 dark:border-brand-800 dark:bg-surface-800 dark:text-brand-300 dark:hover:bg-brand-950/60 active:scale-95"
          >
            <span>✨ Explore Sample Meeting</span>
          </button>
        )}
      </div>
    </div>
  );
}
