'use client';

import React from 'react';
import { Sparkles, CheckCircle2, Tag, BookOpen } from 'lucide-react';
import { Summary } from '@/lib/types';

interface SummaryTabProps {
  summary: Summary | null;
  onRegenerate?: () => void;
}

export function SummaryTab({ summary, onRegenerate }: SummaryTabProps) {
  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-surface-400">
        <Sparkles className="h-8 w-8 mb-2 text-brand-500 animate-pulse" />
        <p className="text-xs font-semibold text-surface-700 dark:text-surface-300">
          No AI Summary generated yet
        </p>
        <p className="text-[11px] mt-0.5 max-w-xs">
          Click &ldquo;Regenerate AI&rdquo; to analyze this transcript with Groq LLM (LLaMA 3.3).
        </p>
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="mt-4 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700"
          >
            Generate AI Summary
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Section */}
      <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4 dark:border-brand-900/40 dark:bg-brand-950/20">
        <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300 mb-2">
          <BookOpen className="h-4 w-4" />
          <h4 className="text-xs font-bold uppercase tracking-wider">Executive Overview</h4>
        </div>
        <p className="text-xs leading-relaxed text-surface-800 dark:text-surface-200">
          {summary.overview}
        </p>
      </div>

      {/* Key Takeaways / Points */}
      {summary.key_points && summary.key_points.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-surface-700 dark:text-surface-300">
              Key Decisions & Takeaways
            </h4>
          </div>
          <div className="space-y-2">
            {summary.key_points.map((point, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-xl border border-surface-100 bg-surface-50/80 p-3 text-xs leading-relaxed text-surface-800 dark:border-surface-800 dark:bg-surface-800/50 dark:text-surface-200"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {i + 1}
                </span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topic Tags / Keywords */}
      {summary.keywords && summary.keywords.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Tag className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-surface-700 dark:text-surface-300">
              Topics & Extracted Tags
            </h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {summary.keywords.map((kw, i) => (
              <span
                key={i}
                className="rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300"
              >
                #{kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
