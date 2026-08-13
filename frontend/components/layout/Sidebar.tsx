'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Mic,
  BarChart3,
  Boxes,
  Settings,
  Bot,
  Zap,
  Sparkles,
  ChevronRight,
  Headphones,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

const NAV_ITEMS = [
  { label: 'Meetings Library', href: '/', icon: Mic },
  { label: 'Analytics & Insights', href: '/analytics', icon: BarChart3 },
  { label: 'Integrations Hub', href: '/integrations', icon: Boxes },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { setComingSoonFeature } = useAppStore();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col justify-between border-r border-surface-200 bg-white px-4 py-5 dark:border-surface-800 dark:bg-surface-950">
      {/* Brand Logo */}
      <div className="flex flex-col gap-6">
        <Link href="/" className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-500 shadow-md shadow-brand-600/30">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-heading text-lg font-bold tracking-tight text-surface-900 dark:text-white">
                Fireflies<span className="text-brand-600 dark:text-brand-400">.ai</span>
              </span>
            </div>
            <span className="text-[10px] font-medium tracking-wider text-surface-400 uppercase">
              Scaler AI Labs Edition
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1">
          <span className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-surface-400 uppercase">
            Workspace
          </span>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 shadow-xs dark:bg-brand-950/60 dark:text-brand-300 font-semibold'
                    : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-900 dark:hover:text-surface-200'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-surface-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Fred Bot Invite Card & Storage */}
      <div className="flex flex-col gap-4">
        {/* Fred Bot Live Card */}
        <div className="rounded-2xl border border-brand-200 bg-gradient-to-b from-brand-50/80 to-white p-4 shadow-xs dark:border-brand-800/80 dark:from-brand-950/90 dark:to-surface-900">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-xs">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-surface-900 dark:text-white">Fred AI Assistant</h4>
              <p className="text-[11px] text-surface-500 dark:text-surface-300">Auto-join live Zoom / Meet</p>
            </div>
          </div>
          <button
            onClick={() => setComingSoonFeature('Fred Live Meeting Assistant')}
            className="mt-3 flex w-full items-center justify-between rounded-xl bg-brand-600/10 px-3 py-1.5 text-xs font-semibold text-brand-700 transition-all hover:bg-brand-600 hover:text-white dark:bg-brand-500/20 dark:text-brand-200 dark:hover:bg-brand-600 dark:hover:text-white"
          >
            <span>Invite Fred</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Workspace Storage Tier */}
        <div className="rounded-xl border border-surface-200 bg-surface-50 p-3 dark:border-surface-800 dark:bg-surface-900">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-surface-600 dark:text-surface-400">Transcribed Audio</span>
            <span className="font-semibold text-surface-800 dark:text-surface-200">5 / 50 hrs</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-200 dark:bg-surface-800">
            <div className="h-full w-[10%] rounded-full bg-brand-600"></div>
          </div>
        </div>
      </div>
    </aside>
  );
}
