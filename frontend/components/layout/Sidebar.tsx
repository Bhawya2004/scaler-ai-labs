'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Bot,
  Video,
  BarChart3,
  UploadCloud,
  Boxes,
  Users,
  Star,
  Settings,
  MoreHorizontal,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

export function Sidebar() {
  const pathname = usePathname();
  const { setComingSoonFeature } = useAppStore();

  const primaryItems = [
    { label: 'Home / Library', href: '/', icon: Home },
    { label: 'Ask Fred AI', href: '#fred', icon: Bot, isMock: true },
    { label: 'Meetings', href: '#meetings', icon: Video, isMock: true },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Upload Transcript', href: '#upload', icon: UploadCloud, isMock: true },
    { label: 'Integrations', href: '/integrations', icon: Boxes },
    { label: 'Workspace Team', href: '#team', icon: Users, isMock: true },
    { label: 'Starred Notes', href: '#starred', icon: Star, isMock: true },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-16 flex-col items-center justify-between border-r border-line bg-white py-4 dark:border-surface-800 dark:bg-surface-950">
      {/* Brand Butterfly Logo */}
      <div className="flex flex-col items-center gap-6 w-full">
        <Link href="/" className="group flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-pink-500 to-rose-600 shadow-xs">
          {/* Custom Butterly/Fireflies logo using shapes */}
          <div className="relative flex h-5 w-5 items-center justify-center">
            <span className="absolute left-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-white opacity-90" />
            <span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-white opacity-80" />
            <span className="absolute left-1.5 bottom-0.5 h-2 w-2 rounded-full bg-white opacity-70" />
          </div>
        </Link>

        {/* Navigation Icons list */}
        <nav className="flex flex-col items-center gap-1 w-full px-2">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.isMock
              ? false
              : pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            if (item.isMock) {
              return (
                <button
                  key={item.label}
                  onClick={() => setComingSoonFeature(item.label)}
                  title={item.label}
                  className="group relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-600 transition-all hover:bg-surface-sunken hover:text-brand-500 dark:text-surface-400 dark:hover:bg-surface-900"
                >
                  <Icon className="h-5 w-5 text-ink-600/70 group-hover:text-brand-500 dark:text-surface-400" />
                  {/* Tooltip */}
                  <span className="absolute left-14 z-55 hidden whitespace-nowrap rounded-md bg-ink-900 px-2 py-1 text-[10px] font-bold text-white shadow-md group-hover:block">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-500 dark:bg-brand-950/60 dark:text-brand-300'
                    : 'text-ink-600 hover:bg-surface-sunken hover:text-brand-500 dark:text-surface-400 dark:hover:bg-surface-900'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-brand-500' : 'text-ink-600/70 dark:text-surface-400'}`} />
                {/* Tooltip */}
                <span className="absolute left-14 z-55 hidden whitespace-nowrap rounded-md bg-ink-900 px-2 py-1 text-[10px] font-bold text-white shadow-md group-hover:block">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Option */}
      <div className="flex flex-col items-center gap-3 w-full px-2">
        <button
          onClick={() => setComingSoonFeature('Advanced Menu')}
          title="More Options"
          className="group relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-600 hover:bg-surface-sunken hover:text-brand-500 dark:text-surface-400 dark:hover:bg-surface-900"
        >
          <MoreHorizontal className="h-5 w-5 text-ink-600/70 dark:text-surface-400" />
          <span className="absolute left-14 z-55 hidden whitespace-nowrap rounded-md bg-ink-900 px-2 py-1 text-[10px] font-bold text-white shadow-md group-hover:block">
            More Options
          </span>
        </button>
      </div>
    </aside>
  );
}
