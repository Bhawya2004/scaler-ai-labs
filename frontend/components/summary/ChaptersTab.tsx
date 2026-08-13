'use client';

import React from 'react';
import { Bookmark, Play, ListFilter } from 'lucide-react';
import { Chapter } from '@/lib/types';
import { formatTime } from '@/lib/utils';
import { usePlayerStore } from '@/lib/store';

interface ChaptersTabProps {
  chapters: Chapter[];
}

export function ChaptersTab({ chapters }: ChaptersTabProps) {
  const { seekTo, currentTime } = usePlayerStore();

  if (!chapters || chapters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-surface-400">
        <Bookmark className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-xs font-semibold text-surface-700 dark:text-surface-300">
          No Smart Chapters yet
        </p>
        <p className="text-[11px] mt-0.5 max-w-xs">
          Smart chapters are automatically extracted when you generate an AI summary with Groq.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <ListFilter className="h-4 w-4 text-brand-600 dark:text-brand-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-surface-700 dark:text-surface-300">
          Meeting Agenda & Chapter Outline
        </h4>
      </div>

      <div className="space-y-2.5">
        {chapters.map((ch, idx) => {
          const isActive = currentTime >= ch.start_time && currentTime <= ch.end_time;

          return (
            <div
              key={ch.id}
              onClick={() => seekTo(ch.start_time)}
              className={`group flex cursor-pointer items-start justify-between gap-3.5 rounded-2xl border p-4 transition-all hover:border-brand-400 ${
                isActive
                  ? 'border-brand-300 bg-brand-50/70 dark:border-brand-800 dark:bg-brand-950/40 shadow-xs'
                  : 'border-surface-200 bg-white hover:bg-surface-50 dark:border-surface-800 dark:bg-surface-900'
              }`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-bold text-surface-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {ch.title}
                    </h5>
                  </div>
                  {ch.summary && (
                    <p className="mt-1 text-xs leading-relaxed text-surface-600 dark:text-surface-300 line-clamp-2">
                      {ch.summary}
                    </p>
                  )}
                </div>
              </div>

              {/* Time pill jump CTA */}
              <div className="flex shrink-0 items-center gap-1 rounded-lg bg-surface-100 px-2 py-1 text-[11px] font-mono font-semibold text-surface-600 group-hover:bg-brand-600 group-hover:text-white dark:bg-surface-800 dark:text-surface-300 transition-colors">
                <Play className="h-2.5 w-2.5 fill-current" />
                <span>{formatTime(ch.start_time)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
