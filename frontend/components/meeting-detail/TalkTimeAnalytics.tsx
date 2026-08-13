'use client';

import React from 'react';
import { Users, PieChart } from 'lucide-react';
import { formatTime, getSpeakerStyle, getInitials } from '@/lib/utils';

interface TalkTimeAnalyticsProps {
  talkTimeBreakdown: {
    speaker: string;
    seconds: number;
    percentage: number;
  }[];
}

const BAR_COLORS = [
  'bg-purple-500',
  'bg-indigo-500',
  'bg-sky-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
];

export function TalkTimeAnalytics({ talkTimeBreakdown }: TalkTimeAnalyticsProps) {
  if (!talkTimeBreakdown || talkTimeBreakdown.length === 0) return null;

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-4 shadow-xs dark:border-surface-800 dark:bg-surface-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChart className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          <h4 className="text-xs font-bold text-surface-900 dark:text-white">
            Speaker Talk-Time Distribution
          </h4>
        </div>
        <span className="text-[11px] font-medium text-surface-400">
          {talkTimeBreakdown.length} Participants
        </span>
      </div>

      {/* Multi-color Talk-Time Progress Bar */}
      <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
        {talkTimeBreakdown.map((item, idx) => (
          <div
            key={idx}
            style={{ width: `${item.percentage}%` }}
            title={`${item.speaker}: ${item.percentage}% (${formatTime(item.seconds)})`}
            className={`h-full transition-all ${BAR_COLORS[idx % BAR_COLORS.length]}`}
          />
        ))}
      </div>

      {/* Breakdown Badges */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {talkTimeBreakdown.map((item, idx) => {
          const style = getSpeakerStyle(item.speaker);
          return (
            <div
              key={idx}
              className="flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-50/80 px-2.5 py-1 text-xs dark:border-surface-800 dark:bg-surface-800/60"
            >
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold ${style.bg} ${style.text}`}
              >
                {getInitials(item.speaker)}
              </div>
              <span className="font-semibold text-surface-800 dark:text-surface-200 truncate max-w-[120px]">
                {item.speaker}
              </span>
              <span className="font-mono text-[11px] font-bold text-brand-600 dark:text-brand-400">
                {item.percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
