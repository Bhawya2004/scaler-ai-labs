'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  Calendar,
  Users,
  CheckSquare,
  Sparkles,
  Play,
  MoreVertical,
  Edit2,
  Trash2,
  Share2,
} from 'lucide-react';
import { MeetingListItem } from '@/lib/types';
import { formatDuration, formatMeetingDate, getSpeakerStyle, getInitials } from '@/lib/utils';
import { usePlayerStore } from '@/lib/store';

interface MeetingCardProps {
  meeting: MeetingListItem;
  onEdit: (m: MeetingListItem) => void;
  onDelete: (m: MeetingListItem) => void;
}

export function MeetingCard({ meeting, onEdit, onDelete }: MeetingCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { seekTo } = usePlayerStore();

  const participantsList = Array.isArray(meeting.participants)
    ? meeting.participants
    : [];

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(31,32,51,0.04),_0_1px_8px_rgba(31,32,51,0.04)] transition-all hover:border-brand-500 dark:border-surface-800 dark:bg-surface-900 dark:hover:border-brand-700">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="rounded-full border border-brand-100 bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold text-brand-600 dark:bg-brand-950 dark:text-brand-300">
            {meeting.meeting_type || 'General'}
          </span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-semibold text-ink-400 dark:text-surface-400">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(meeting.duration_seconds)}
            </span>

            {/* Quick Menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setMenuOpen(!menuOpen);
                }}
                className="rounded-lg p-1 text-ink-400 hover:bg-surface-sunken hover:text-ink-900 dark:hover:bg-surface-800"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)}></div>
                  <div className="absolute right-0 top-6 z-20 w-32 rounded-xl border border-line bg-white p-1 shadow-md dark:border-surface-800 dark:bg-surface-900">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        onEdit(meeting);
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold text-ink-600 hover:bg-surface-sunken dark:text-surface-300 dark:hover:bg-surface-800"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        onDelete(meeting);
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold text-accent-red hover:bg-rose-50 dark:hover:bg-rose-950/50"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Meeting Link Area */}
        <Link href={`/meetings/${meeting.id}`} className="block">
          <h3 className="font-heading text-sm font-bold text-ink-900 hover:text-brand-500 transition-colors dark:text-white line-clamp-2">
            {meeting.title}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-ink-400 dark:text-surface-400">
            <Calendar className="h-3.5 w-3.5" />
            {formatMeetingDate(meeting.meeting_date)}
          </p>

          {/* AI Summary Snippet */}
          {meeting.summary_overview && (
            <p className="mt-2.5 text-xs leading-relaxed text-ink-600 dark:text-surface-300 line-clamp-2">
              {meeting.summary_overview}
            </p>
          )}
        </Link>
      </div>

      {/* Footer Info */}
      <div className="mt-4 flex items-center justify-between border-t border-line pt-3 dark:border-surface-800">
        {/* Participants Avatar Stack */}
        <div className="flex items-center -space-x-1.5 overflow-hidden">
          {participantsList.slice(0, 3).map((p, idx) => {
            const style = getSpeakerStyle(p);
            return (
              <div
                key={idx}
                title={p}
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold ring-2 ring-white ${style.bg} ${style.text} dark:ring-surface-900`}
              >
                {getInitials(p)}
              </div>
            );
          })}
          {participantsList.length > 3 && (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-sunken text-[9px] font-bold text-ink-600 ring-2 ring-white dark:bg-surface-800 dark:text-surface-400 dark:ring-surface-900">
              +{participantsList.length - 3}
            </div>
          )}
        </div>

        {/* Action Items or Processing Status */}
        <div className="flex items-center gap-2">
          {meeting.status === 'processing' ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-accent-amber/30 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-accent-amber animate-pulse">
              Processing...
            </span>
          ) : (
            meeting.action_items_count > 0 && (
              <span className="flex items-center gap-1 rounded-full border border-accent-green/20 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-accent-green">
                <CheckSquare className="h-3 w-3" />
                <span>{meeting.action_items_count} Action Items</span>
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
