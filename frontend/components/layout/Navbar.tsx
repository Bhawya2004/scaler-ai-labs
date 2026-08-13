'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Moon,
  Sun,
  Plus,
  Sparkles,
  LogOut,
  User,
  Settings,
  LogIn,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

interface NavbarProps {
  onOpenCreateModal?: () => void;
}

export function Navbar({ onOpenCreateModal }: NavbarProps) {
  const router = useRouter();
  const { theme, toggleTheme, setCommandPaletteOpen, setComingSoonFeature, user, logout } = useAppStore();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    toast.info('You have signed out of Fireflies.ai');
    router.push('/login');
  };

  const handleThemeToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const doc = document as any;
    if (!doc.startViewTransition) {
      toggleTheme();
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = doc.startViewTransition(() => {
      toggleTheme();
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];
      
      document.documentElement.animate(
        {
          clipPath: theme === 'light' ? clipPath : [...clipPath].reverse(),
        },
        {
          duration: 450,
          easing: 'ease-in-out',
          pseudoElement: theme === 'light' ? '::view-transition-new(root)' : '::view-transition-old(root)',
        }
      );
    });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-line bg-white px-6 dark:border-surface-800 dark:bg-surface-900">
      {/* Global Search Bar (Trigger for Cmd+K palette) */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex h-9 w-80 items-center justify-between rounded-xl border border-line bg-surface-sunken px-3 text-xs text-ink-600 transition-all hover:bg-white hover:text-ink-900 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300"
        >
          <div className="flex items-center gap-2.5">
            <Search className="h-3.5 w-3.5 text-ink-400" />
            <span className="truncate">Search transcripts, notes, meetings...</span>
          </div>
          <kbd className="hidden rounded-md border border-line bg-white px-1.5 py-0.5 text-[9px] font-bold text-ink-400 sm:inline-block dark:border-surface-700 dark:bg-surface-700">
            ⌘K
          </kbd>
        </button>

        {/* Fred AI Assistant Live Indicator */}
        <button
          onClick={() => setComingSoonFeature('Fred Live Meeting Assistant')}
          className="hidden items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-600 transition-all hover:bg-brand-100 md:flex dark:border-brand-800 dark:bg-brand-950"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-500"></span>
          </span>
          <Sparkles className="h-3 w-3 text-brand-500" />
          <span>Fred Bot: Ready</span>
        </button>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        {/* New Meeting CTA */}
        {onOpenCreateModal && (
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-600 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Upload Meeting</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={handleThemeToggle}
          aria-label="Toggle theme"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-white text-ink-600 hover:bg-surface-sunken dark:border-surface-700 dark:bg-surface-800"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-accent-amber" />
          ) : (
            <Moon className="h-4 w-4 text-ink-600" />
          )}
        </button>

        {/* User Profile / Auth Button */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-xl border border-transparent p-1 transition-all hover:bg-surface-sunken dark:hover:bg-surface-800"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-600 text-xs">
                {user.avatarInitials || 'BG'}
              </div>
              <div className="hidden flex-col text-left lg:flex">
                <span className="text-xs font-bold text-ink-900 dark:text-white">
                  {user.name}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-ink-400" />
            </button>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setProfileOpen(false)}
                ></div>
                <div className="absolute right-0 top-12 z-30 w-56 rounded-2xl border border-surface-200 bg-white p-2 shadow-xl dark:border-surface-800 dark:bg-surface-900 animate-slide-up">
                  <div className="px-3 py-2 border-b border-surface-100 dark:border-surface-800">
                    <p className="text-xs font-bold text-surface-900 dark:text-white">{user.name}</p>
                    <p className="text-[11px] text-surface-400 truncate">{user.email}</p>
                    <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-3 w-3" /> Logged In
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-surface-700 hover:bg-surface-100 dark:text-surface-200 dark:hover:bg-surface-800"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      <span>Workspace Settings</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-surface-100 dark:border-surface-800">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}
