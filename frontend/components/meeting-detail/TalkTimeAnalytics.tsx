'use client';

import React from 'react';
import { Users, PieChart, RefreshCw, BarChart2, ShieldAlert, ArrowRight } from 'lucide-react';
import { formatTime, getSpeakerStyle, getInitials } from '@/lib/utils';

interface TalkTimeAnalyticsProps {
  talkTimeBreakdown: {
    speaker: string;
    seconds: number;
    percentage: number;
  }[];
  dominanceScore?: number;
  meetingBalance?: string;
  conversationFlow?: {
    from_speaker: string;
    to_speaker: string;
    count: number;
  }[];
}

const BAR_COLORS = [
  'bg-brand-500',
  'bg-pink-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-sky-500',
  'bg-violet-500',
];

export function TalkTimeAnalytics({
  talkTimeBreakdown,
  dominanceScore = 0,
  meetingBalance = 'Highly Balanced',
  conversationFlow = [],
}: TalkTimeAnalyticsProps) {
  if (!talkTimeBreakdown || talkTimeBreakdown.length === 0) return null;

  // Find dominant speaker
  const topSpeaker = talkTimeBreakdown[0];

  // Helper for balance label color
  const getBalanceBadgeColor = (balance: string) => {
    if (balance.includes('Monopolized')) return 'bg-rose-50 text-accent-red border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/50';
    if (balance.includes('Dominant')) return 'bg-amber-50 text-accent-amber border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50';
    return 'bg-emerald-50 text-accent-green border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50';
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left Card: Talk Time & Dominance Score */}
      <div className="lg:col-span-7 rounded-xl border border-line bg-white p-5 shadow-xs dark:border-surface-800 dark:bg-surface-900 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-brand-500" />
              <h4 className="text-xs font-bold text-ink-900 dark:text-white uppercase tracking-wider">
                Talk-Time Distribution
              </h4>
            </div>
            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getBalanceBadgeColor(meetingBalance)}`}>
              {meetingBalance}
            </span>
          </div>

          {/* Multi-color Talk-Time Progress Bar */}
          <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-surface-sunken dark:bg-surface-800">
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
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {talkTimeBreakdown.map((item, idx) => {
              const style = getSpeakerStyle(item.speaker);
              const colorDot = BAR_COLORS[idx % BAR_COLORS.length];
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-xl border border-line bg-white px-2.5 py-1 text-xs dark:border-surface-800 dark:bg-surface-900"
                >
                  <div className={`h-2 w-2 rounded-full ${colorDot}`} />
                  <span className="font-bold text-ink-900 dark:text-surface-200 truncate max-w-[120px]">
                    {item.speaker}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-brand-500">
                    {item.percentage}%
                  </span>
                  <span className="text-[10px] text-ink-400 font-medium">
                    ({formatTime(item.seconds)})
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dominance Summary Insight */}
        {topSpeaker && (
          <div className="mt-4 pt-3 border-t border-line dark:border-surface-800 flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-950">
              <BarChart2 className="h-4.5 w-4.5" />
            </div>
            <p className="text-xs text-ink-600 dark:text-surface-300 leading-normal">
              <span className="font-bold text-ink-900 dark:text-white">{topSpeaker.speaker}</span> spoke the most with <span className="font-bold text-brand-500">{topSpeaker.percentage}%</span> of the total conversation time.
            </p>
          </div>
        )}
      </div>

      {/* Right Card: Conversation Flow & Hand-offs */}
      <div className="lg:col-span-5 rounded-xl border border-line bg-white p-5 shadow-xs dark:border-surface-800 dark:bg-surface-900">
        <div className="flex items-center gap-2 mb-3">
          <RefreshCw className="h-4 w-4 text-brand-500" />
          <h4 className="text-xs font-bold text-ink-900 dark:text-white uppercase tracking-wider">
            Interaction Flow Matrix
          </h4>
        </div>
        <p className="text-[11px] text-ink-600 dark:text-surface-400 mb-4">
          Tracking chronological speaker hand-offs (who spoke directly after whom).
        </p>

        {conversationFlow.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-ink-400">
            <span className="text-xs font-semibold">No flow data available</span>
            <span className="text-[10px]">Matrix requires speaker switches.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[148px] overflow-y-auto pr-1">
            {conversationFlow.slice(0, 4).map((flow, idx) => {
              const fromStyle = getSpeakerStyle(flow.from_speaker);
              const toStyle = getSpeakerStyle(flow.to_speaker);

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-line bg-surface-sunken px-3 py-1.5 text-xs dark:border-surface-800 dark:bg-surface-800/40"
                >
                  <div className="flex items-center gap-2">
                    {/* From Speaker */}
                    <span className="font-bold text-ink-900 dark:text-white truncate max-w-[90px]">
                      {flow.from_speaker}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-ink-400" />
                    {/* To Speaker */}
                    <span className="font-bold text-ink-900 dark:text-white truncate max-w-[90px]">
                      {flow.to_speaker}
                    </span>
                  </div>
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-600 dark:bg-brand-950">
                    {flow.count} switches
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
