'use client';

import React, { useState } from 'react';
import { Sparkles, X, CheckCircle2, Bot, Boxes, Users, Lock } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export function ComingSoonModal() {
  const { comingSoonFeature, setComingSoonFeature } = useAppStore();
  const [subscribed, setSubscribed] = useState(false);

  if (!comingSoonFeature) return null;

  const handleNotify = () => {
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setComingSoonFeature(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
      <div
        className="flex w-full max-w-md flex-col items-center overflow-hidden rounded-3xl border border-brand-200 bg-white p-6 text-center shadow-2xl dark:border-surface-800 dark:bg-surface-900 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-lg shadow-brand-600/30">
          <Sparkles className="h-7 w-7" />
        </div>

        <span className="mt-4 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-bold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
          Coming Soon in v2.0
        </span>

        <h3 className="mt-2 font-heading text-lg font-bold text-surface-900 dark:text-white">
          {comingSoonFeature}
        </h3>

        <p className="mt-2 text-xs leading-relaxed text-surface-500">
          This feature is currently in active development for enterprise workspaces. The core post-meeting intelligence, Groq summaries, and interactive transcripts are fully functional.
        </p>

        <div className="mt-6 flex w-full flex-col gap-2">
          {subscribed ? (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              <span>You&apos;ll be notified on release!</span>
            </div>
          ) : (
            <button
              onClick={handleNotify}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-600/20 hover:bg-brand-700 active:scale-98"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Notify Me on Early Access</span>
            </button>
          )}

          <button
            onClick={() => setComingSoonFeature(null)}
            className="rounded-xl border border-surface-200 bg-white px-4 py-2 text-xs font-semibold text-surface-700 hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
