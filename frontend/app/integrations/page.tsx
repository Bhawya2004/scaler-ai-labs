'use client';

import React from 'react';
import {
  Boxes,
  Video,
  MessageSquare,
  FileText,
  Calendar,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

const INTEGRATIONS = [
  {
    name: 'Google Meet',
    category: 'Video Conferencing',
    description: 'Auto-join and record scheduled Google Meet calls from your Google Calendar.',
    icon: Video,
    color: 'from-emerald-500 to-teal-600',
    status: 'Ready to Connect',
  },
  {
    name: 'Zoom Video',
    category: 'Video Conferencing',
    description: 'Sync Zoom cloud recordings and automatically generate structured Groq notes.',
    icon: Video,
    color: 'from-blue-500 to-indigo-600',
    status: 'Ready to Connect',
  },
  {
    name: 'Microsoft Teams',
    category: 'Video Conferencing',
    description: 'Invite Fred meeting assistant to all Microsoft Teams scheduled meetings.',
    icon: Video,
    color: 'from-indigo-500 to-purple-600',
    status: 'Ready to Connect',
  },
  {
    name: 'Slack Sync',
    category: 'Communication',
    description: 'Automatically post meeting summaries and action item checklists to Slack channels.',
    icon: MessageSquare,
    color: 'from-amber-500 to-rose-600',
    status: 'Ready to Connect',
  },
  {
    name: 'Notion Workspace',
    category: 'Knowledge Base',
    description: 'Export AI summaries, chapters, and tasks directly into Notion database pages.',
    icon: FileText,
    color: 'from-neutral-700 to-neutral-900',
    status: 'Ready to Connect',
  },
  {
    name: 'HubSpot & Salesforce CRM',
    category: 'CRM Integration',
    description: 'Log sales call highlights, buyer sentiment, and next steps to deal records.',
    icon: Boxes,
    color: 'from-orange-500 to-red-600',
    status: 'Enterprise Only',
  },
];

export default function IntegrationsPage() {
  const { setComingSoonFeature } = useAppStore();

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <Boxes className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          <h1 className="font-heading text-2xl font-bold tracking-tight text-surface-900 dark:text-white">
            Integrations & Apps Hub
          </h1>
        </div>
        <p className="mt-1 text-xs text-surface-500">
          Connect your video conferencing, team communication, and CRM tools to automate meeting intelligence.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {INTEGRATIONS.map((app, idx) => {
          const Icon = app.icon;
          return (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-2xl border border-surface-200 bg-white p-5 shadow-xs transition-all hover:border-brand-300 hover:shadow-md dark:border-surface-800 dark:bg-surface-900"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr ${app.color} text-white shadow-md`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-surface-100 px-2.5 py-0.5 text-[10px] font-semibold text-surface-600 dark:bg-surface-800 dark:text-surface-300">
                    {app.category}
                  </span>
                </div>

                <h3 className="mt-4 font-heading text-base font-bold text-surface-900 dark:text-white">
                  {app.name}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-surface-500">
                  {app.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between">
                <span className="text-[11px] font-medium text-surface-400">
                  {app.status}
                </span>
                <button
                  onClick={() => setComingSoonFeature(`${app.name} Integration`)}
                  className="rounded-xl bg-brand-600/10 px-3.5 py-1.5 text-xs font-semibold text-brand-700 transition-all hover:bg-brand-600 hover:text-white dark:bg-brand-950 dark:text-brand-300 dark:hover:bg-brand-600 dark:hover:text-white"
                >
                  Connect
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
