'use client';

import React from 'react';
import { Mic, Clock, CheckSquare, Sparkles } from 'lucide-react';
import { GlobalAnalytics } from '@/lib/types';

interface DashboardStatsProps {
  analytics: GlobalAnalytics | null;
}

export function DashboardStats({ analytics }: DashboardStatsProps) {
  const stats = [
    {
      label: 'Meetings Indexed',
      value: analytics ? analytics.total_meetings : 0,
      icon: Mic,
    },
    {
      label: 'Hours Recorded',
      value: analytics ? `${analytics.total_hours}h` : '0h',
      icon: Clock,
    },
    {
      label: 'Action Items Done',
      value: analytics ? `${analytics.completed_action_items}/${analytics.total_action_items}` : '0/0',
      icon: CheckSquare,
    },
    {
      label: 'AI Automation Rate',
      value: analytics && analytics.total_action_items > 0 ? `${analytics.action_completion_rate}%` : '100%',
      icon: Sparkles,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="flex items-center justify-between rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(31,32,51,0.04)] dark:border-surface-800 dark:bg-surface-900"
          >
            <div>
              <p className="text-[11px] font-bold text-ink-600 dark:text-surface-400 uppercase tracking-wider">{item.label}</p>
              <h3 className="mt-1 font-heading text-2xl font-bold text-ink-900 dark:text-white">
                {item.value}
              </h3>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-950 dark:text-brand-400">
              <Icon className="h-5 w-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
