'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Mic, FileText, CheckCircle2, Circle, ArrowRight, Loader2 } from 'lucide-react';
import { useAppStore, usePlayerStore } from '@/lib/store';
import { api } from '@/lib/api';
import { GlobalSearchResult } from '@/lib/types';
import { formatTime, formatMeetingDate } from '@/lib/utils';

export function CommandPalette() {
  const router = useRouter();
  const { isCommandPaletteOpen, setCommandPaletteOpen } = useAppStore();
  const { seekTo } = usePlayerStore();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlobalSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global keydown listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults(null);
    }
  }, [isCommandPaletteOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.globalSearch(query);
        setResults(data);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isCommandPaletteOpen) return null;

  const handleSelectMeeting = (meetingId: string) => {
    setCommandPaletteOpen(false);
    router.push(`/meetings/${meetingId}`);
  };

  const handleSelectTranscript = (meetingId: string, startTime: number) => {
    setCommandPaletteOpen(false);
    seekTo(startTime);
    router.push(`/meetings/${meetingId}?t=${startTime}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-20 backdrop-blur-xs animate-fade-in">
      <div
        className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-2xl dark:border-surface-800 dark:bg-surface-900 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-surface-200 px-4 py-3.5 dark:border-surface-800">
          <Search className="h-5 w-5 text-brand-600 dark:text-brand-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search all meetings, transcripts, action items, or topics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent px-3 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-hidden dark:text-white"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-surface-400" />}
          {query && !loading && (
            <button onClick={() => setQuery('')} className="text-surface-400 hover:text-surface-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search Results Area */}
        <div className="max-h-[420px] overflow-y-auto p-3">
          {!query && (
            <div className="p-8 text-center text-sm text-surface-400">
              <p className="font-medium text-surface-600 dark:text-surface-300">Quick Global Search</p>
              <p className="mt-1 text-xs">Search for spoken dialogue, speaker names, meeting titles, or action items.</p>
            </div>
          )}

          {query && results && results.total_results === 0 && !loading && (
            <div className="p-8 text-center text-sm text-surface-400">
              No results found for &ldquo;<span className="font-semibold text-surface-700 dark:text-surface-300">{query}</span>&rdquo;
            </div>
          )}

          {results && results.total_results > 0 && (
            <div className="space-y-4">
              {/* Matching Meetings */}
              {results.meetings.length > 0 && (
                <div>
                  <h4 className="px-3 text-[11px] font-semibold tracking-wider text-surface-400 uppercase">
                    Meetings ({results.meetings.length})
                  </h4>
                  <div className="mt-1 space-y-1">
                    {results.meetings.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleSelectMeeting(m.id)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                            <Mic className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-surface-900 dark:text-white">{m.title}</p>
                            <p className="text-[11px] text-surface-400">{formatMeetingDate(m.meeting_date)} · {m.meeting_type}</p>
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-surface-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Transcript Dialogue */}
              {results.transcript_matches.length > 0 && (
                <div>
                  <h4 className="px-3 text-[11px] font-semibold tracking-wider text-surface-400 uppercase">
                    Spoken Dialogue ({results.transcript_matches.length})
                  </h4>
                  <div className="mt-1 space-y-1">
                    {results.transcript_matches.map((t) => (
                      <button
                        key={t.segment_id}
                        onClick={() => handleSelectTranscript(t.meeting_id, t.start_time)}
                        className="flex w-full items-start justify-between rounded-xl px-3 py-2 text-left transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
                      >
                        <div className="flex gap-2.5">
                          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface-200 text-[10px] font-bold text-surface-700 dark:bg-surface-800 dark:text-surface-300">
                            {formatTime(t.start_time)}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-surface-900 dark:text-white">
                              <span className="font-semibold text-brand-600 dark:text-brand-400">{t.speaker_name}: </span>
                              &ldquo;{t.text}&rdquo;
                            </p>
                            <p className="mt-0.5 text-[11px] text-surface-400">in {t.meeting_title}</p>
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-surface-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Action Items */}
              {results.action_item_matches.length > 0 && (
                <div>
                  <h4 className="px-3 text-[11px] font-semibold tracking-wider text-surface-400 uppercase">
                    Action Items ({results.action_item_matches.length})
                  </h4>
                  <div className="mt-1 space-y-1">
                    {results.action_item_matches.map((ai) => (
                      <button
                        key={ai.action_item_id}
                        onClick={() => handleSelectMeeting(ai.meeting_id)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
                      >
                        <div className="flex items-center gap-2.5">
                          {ai.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Circle className="h-4 w-4 text-surface-400" />
                          )}
                          <div>
                            <p className="text-xs font-medium text-surface-900 dark:text-white">{ai.task}</p>
                            <p className="text-[11px] text-surface-400">Assignee: {ai.assignee} · in {ai.meeting_title}</p>
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-surface-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Keyboard hints footer */}
        <div className="flex items-center justify-between border-t border-surface-200 bg-surface-50 px-4 py-2 text-[11px] text-surface-400 dark:border-surface-800 dark:bg-surface-950">
          <div className="flex items-center gap-3">
            <span><kbd className="rounded border px-1 py-0.5">↑</kbd> <kbd className="rounded border px-1 py-0.5">↓</kbd> to navigate</span>
            <span><kbd className="rounded border px-1 py-0.5">↵</kbd> to jump</span>
            <span><kbd className="rounded border px-1 py-0.5">esc</kbd> to close</span>
          </div>
          <span className="font-medium text-brand-600 dark:text-brand-400">Fireflies Global Spotlight</span>
        </div>
      </div>
    </div>
  );
}
