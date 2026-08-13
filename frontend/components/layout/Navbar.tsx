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

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-surface-200 bg-white/80 px-6 backdrop-blur-md dark:border-surface-800 dark:bg-surface-900/80">
      {/* Global Search Bar (Trigger for Cmd+K palette) */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex h-10 w-80 items-center justify-between rounded-xl border border-surface-200 bg-surface-50 px-3.5 text-sm text-surface-500 shadow-xs transition-all hover:border-brand-400 hover:bg-white hover:text-surface-800 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300 dark:hover:border-brand-500 dark:hover:bg-surface-750 dark:hover:text-white"
        >
          <div className="flex items-center gap-2.5">
            <Search className="h-4 w-4 text-surface-400 dark:text-surface-400" />
            <span className="truncate">Search transcripts, notes, meetings...</span>
          </div>
          <kbd className="hidden rounded-md border border-surface-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-surface-400 shadow-2xs sm:inline-block dark:border-surface-700 dark:bg-surface-700 dark:text-surface-200">
            ⌘K
          </kbd>
        </button>

        {/* Fred AI Assistant Live Indicator */}
        <button
          onClick={() => setComingSoonFeature('Fred Live Meeting Assistant')}
          className="hidden items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 transition-all hover:bg-brand-100 md:flex dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600"></span>
          </span>
          <Sparkles className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
          <span>Fred Bot: Ready</span>
        </button>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        {/* New Meeting CTA */}
        {onOpenCreateModal && (
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-600/20 transition-all hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/30 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Upload Meeting</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-surface-200 bg-white text-surface-600 transition-all hover:border-surface-300 hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300 dark:hover:border-surface-600 dark:hover:text-white"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-surface-600" />
          )}
        </button>

        {/* User Profile / Auth Button */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 rounded-xl border border-transparent p-1.5 transition-all hover:bg-surface-100 dark:hover:bg-surface-800"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 font-bold text-white text-xs shadow-xs">
                {user.avatarInitials || 'BG'}
              </div>
              <div className="hidden flex-col text-left lg:flex">
                <span className="text-xs font-bold text-surface-900 dark:text-white">
                  {user.name}
                </span>
                <span className="text-[11px] text-surface-400">{user.workspace}</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-surface-400" />
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
