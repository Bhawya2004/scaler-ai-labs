'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Clock,
  Mic,
  CheckSquare,
  Sparkles,
  TrendingUp,
  Tag,
  Users,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { GlobalAnalytics, MeetingListItem } from '@/lib/types';
import { formatDuration } from '@/lib/utils';
import Link from 'next/link';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<GlobalAnalytics | null>(null);
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [a, m] = await Promise.all([
          api.getGlobalAnalytics(),
          api.getMeetings(),
        ]);
        setAnalytics(a);
        setMeetings(m);
      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center text-surface-400">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600 dark:text-brand-400 mb-3" />
        <p className="text-xs font-semibold text-surface-700 dark:text-surface-300">
          Calculating Workspace Intelligence...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          <h1 className="font-heading text-2xl font-bold tracking-tight text-surface-900 dark:text-white">
            Workspace Meeting Analytics & Insights
          </h1>
        </div>
        <p className="mt-1 text-xs text-surface-500">
          Aggregate productivity metrics, talk-time breakdown, and recurring topic trends across all meetings.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-5 dark:border-purple-900/50 dark:bg-purple-950/30">
          <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Recorded</span>
            <Mic className="h-5 w-5" />
          </div>
          <h3 className="mt-2 font-heading text-3xl font-bold text-surface-900 dark:text-white">
            {analytics?.total_meetings || 0}
          </h3>
          <p className="mt-1 text-[11px] text-surface-500">Meetings indexed & transcribed</p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 dark:border-blue-900/50 dark:bg-blue-950/30">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Duration</span>
            <Clock className="h-5 w-5" />
          </div>
          <h3 className="mt-2 font-heading text-3xl font-bold text-surface-900 dark:text-white">
            {analytics?.total_hours || 0} hrs
          </h3>
          <p className="mt-1 text-[11px] text-surface-500">Combined conversation time</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">Task Completion</span>
            <CheckSquare className="h-5 w-5" />
          </div>
          <h3 className="mt-2 font-heading text-3xl font-bold text-surface-900 dark:text-white">
            {analytics?.action_completion_rate || 0}%
          </h3>
          <p className="mt-1 text-[11px] text-surface-500">
            {analytics?.completed_action_items} of {analytics?.total_action_items} action items done
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 dark:border-amber-900/50 dark:bg-amber-950/30">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider">AI Efficiency</span>
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="mt-2 font-heading text-3xl font-bold text-surface-900 dark:text-white">
            4.2x
          </h3>
          <p className="mt-1 text-[11px] text-surface-500">Review time saved per meeting</p>
        </div>
      </div>

      {/* Top Topics & Recurring Tags */}
      <div className="rounded-2xl border border-surface-200 bg-white p-6 dark:border-surface-800 dark:bg-surface-900">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          <h3 className="font-heading text-base font-bold text-surface-900 dark:text-white">
            Top Recurring Meeting Topics (AI Extracted)
          </h3>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {(analytics?.top_topics || []).map((topic, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700 dark:border-brand-900/50 dark:bg-brand-950/50 dark:text-brand-300"
            >
              <Sparkles className="h-3 w-3" />
              <span>#{topic}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Meetings Breakdown Table */}
      <div className="rounded-2xl border border-surface-200 bg-white p-6 dark:border-surface-800 dark:bg-surface-900">
        <h3 className="font-heading text-base font-bold text-surface-900 dark:text-white mb-4">
          Recent Meeting Details
        </h3>
        <div className="space-y-3">
          {meetings.map((m) => (
            <Link
              key={m.id}
              href={`/meetings/${m.id}`}
              className="flex items-center justify-between rounded-xl border border-surface-100 p-3.5 transition-all hover:border-brand-300 hover:bg-surface-50 dark:border-surface-800 dark:hover:border-brand-700 dark:hover:bg-surface-800/60"
            >
              <div>
                <h4 className="text-xs font-bold text-surface-900 dark:text-white">{m.title}</h4>
                <p className="text-[11px] text-surface-400 mt-0.5">
                  {m.meeting_type} · {formatDuration(m.duration_seconds)} · {m.transcript_count} speech segments
                </p>
              </div>
              <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                View Room →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
