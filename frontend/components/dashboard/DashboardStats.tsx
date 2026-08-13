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
      label: 'Meetings Transcribed',
      value: analytics ? analytics.total_meetings : 0,
      icon: Mic,
      gradient: 'from-purple-500 to-indigo-600',
      bgLight: 'bg-purple-50 dark:bg-purple-950/40',
      borderLight: 'border-purple-200 dark:border-purple-900/50',
    },
    {
      label: 'Hours Recorded',
      value: analytics ? `${analytics.total_hours}h` : '0h',
      icon: Clock,
      gradient: 'from-blue-500 to-sky-600',
      bgLight: 'bg-blue-50 dark:bg-blue-950/40',
      borderLight: 'border-blue-200 dark:border-blue-900/50',
    },
    {
      label: 'Action Items Done',
      value: analytics ? `${analytics.completed_action_items}/${analytics.total_action_items}` : '0/0',
      icon: CheckSquare,
      gradient: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderLight: 'border-emerald-200 dark:border-emerald-900/50',
    },
    {
      label: 'AI Automation Rate',
      value: analytics && analytics.total_action_items > 0 ? `${analytics.action_completion_rate}%` : '100%',
      icon: Sparkles,
      gradient: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50 dark:bg-amber-950/40',
      borderLight: 'border-amber-200 dark:border-amber-900/50',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className={`flex items-center justify-between rounded-2xl border ${item.borderLight} ${item.bgLight} p-4 shadow-xs transition-all hover:shadow-md`}
          >
            <div>
              <p className="text-xs font-medium text-surface-500 dark:text-surface-400">{item.label}</p>
              <h3 className="mt-1 font-heading text-2xl font-bold text-surface-900 dark:text-white">
                {item.value}
              </h3>
            </div>
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr ${item.gradient} text-white shadow-md`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
