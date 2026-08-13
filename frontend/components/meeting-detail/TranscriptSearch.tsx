'use client';

import React from 'react';
import { Search, ChevronUp, ChevronDown, X, User } from 'lucide-react';

interface TranscriptSearchProps {
  query: string;
  onQueryChange: (q: string) => void;
  matchCount: number;
  currentMatchIndex: number;
  onNextMatch: () => void;
  onPrevMatch: () => void;
  speakers: string[];
  selectedSpeaker: string;
  onSpeakerChange: (speaker: string) => void;
}

export function TranscriptSearch({
  query,
  onQueryChange,
  matchCount,
  currentMatchIndex,
  onNextMatch,
  onPrevMatch,
  speakers,
  selectedSpeaker,
  onSpeakerChange,
}: TranscriptSearchProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-surface-200 bg-surface-50 p-2.5 dark:border-surface-800 dark:bg-surface-900/60">
      {/* Search Input Bar */}
      <div className="relative flex flex-1 items-center min-w-[200px]">
        <Search className="absolute left-3 h-3.5 w-3.5 text-surface-400" />
        <input
          type="text"
          placeholder="Search within this transcript..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="h-8 w-full rounded-xl border border-surface-200 bg-white pl-8 pr-16 text-xs text-surface-900 placeholder:text-surface-400 focus:border-brand-500 focus:outline-hidden dark:border-surface-700 dark:bg-surface-800 dark:text-white"
        />

        {query && (
          <div className="absolute right-2 flex items-center gap-1">
            <span className="text-[10px] font-semibold text-surface-400">
              {matchCount > 0 ? `${currentMatchIndex + 1}/${matchCount}` : '0/0'}
            </span>
            <button
              onClick={() => onQueryChange('')}
              className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Controls: Next/Prev & Speaker Filter */}
      <div className="flex items-center gap-1.5">
        {matchCount > 0 && (
          <div className="flex items-center gap-0.5 rounded-xl border border-surface-200 bg-white p-0.5 dark:border-surface-700 dark:bg-surface-800">
            <button
              onClick={onPrevMatch}
              className="rounded-lg p-1 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700"
              title="Previous match"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onNextMatch}
              className="rounded-lg p-1 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700"
              title="Next match"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Filter by Speaker */}
        <select
          value={selectedSpeaker}
          onChange={(e) => onSpeakerChange(e.target.value)}
          className="h-8 rounded-xl border border-surface-200 bg-white px-2.5 text-xs font-semibold text-surface-700 focus:border-brand-500 focus:outline-hidden dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300"
        >
          <option value="All">All Speakers</option>
          {speakers.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
