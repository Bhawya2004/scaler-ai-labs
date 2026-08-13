'use client';

import React, { useState } from 'react';
import { Play, Copy, Check, MessageSquarePlus } from 'lucide-react';
import { TranscriptSegment } from '@/lib/types';
import { formatTime, getSpeakerStyle, getInitials } from '@/lib/utils';
import { usePlayerStore } from '@/lib/store';

interface TranscriptLineProps {
  segment: TranscriptSegment;
  isActive: boolean;
  searchQuery?: string;
  onAddComment?: (segmentId: string) => void;
}

export function TranscriptLine({
  segment,
  isActive,
  searchQuery,
  onAddComment,
}: TranscriptLineProps) {
  const { seekTo } = usePlayerStore();
  const [copied, setCopied] = useState(false);

  const speakerStyle = getSpeakerStyle(segment.speaker_name);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`[${formatTime(segment.start_time)}] ${segment.speaker_name}: ${segment.text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Search keyword highlight generator
  const renderHighlightedText = (text: string, query?: string) => {
    if (!query || !query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark
              key={i}
              className="rounded-sm bg-amber-200 px-0.5 font-bold text-amber-900 dark:bg-amber-500/30 dark:text-amber-200"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div
      id={`transcript-segment-${segment.id}`}
      onClick={() => seekTo(segment.start_time)}
      className={`group relative flex cursor-pointer gap-3.5 rounded-2xl p-3.5 transition-all ${
        isActive
          ? 'bg-brand-50/90 border border-brand-300 shadow-xs dark:bg-brand-950/50 dark:border-brand-800'
          : 'border border-transparent hover:bg-surface-50 dark:hover:bg-surface-800/60'
      }`}
    >
      {/* Speaker Avatar */}
      <div className="shrink-0">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold shadow-xs ${speakerStyle.bg} ${speakerStyle.text} border ${speakerStyle.border}`}
        >
          {getInitials(segment.speaker_name)}
        </div>
      </div>

      {/* Content Column */}
      <div className="flex-1 min-w-0">
        {/* Speaker Name & Timestamp */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-surface-900 dark:text-white">
              {segment.speaker_name}
            </span>
            <span className="flex items-center gap-1 rounded-md bg-surface-100 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-surface-500 hover:bg-brand-100 hover:text-brand-700 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-brand-900/60 dark:hover:text-brand-300">
              <Play className="h-2.5 w-2.5 fill-current" />
              {formatTime(segment.start_time)}
            </span>
          </div>

          {/* Quick Hover Actions (Copy, Add Comment) */}
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {onAddComment && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddComment(segment.id);
                }}
                title="Add Note/Comment"
                className="rounded-lg p-1 text-surface-400 hover:bg-surface-200 hover:text-surface-700 dark:hover:bg-surface-700 dark:hover:text-surface-200"
              >
                <MessageSquarePlus className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={handleCopy}
              title="Copy utterance"
              className="rounded-lg p-1 text-surface-400 hover:bg-surface-200 hover:text-surface-700 dark:hover:bg-surface-700 dark:hover:text-surface-200"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Spoken Text */}
        <p className="mt-1 text-xs leading-relaxed text-surface-700 dark:text-surface-300">
          {renderHighlightedText(segment.text, searchQuery)}
        </p>
      </div>
    </div>
  );
}
