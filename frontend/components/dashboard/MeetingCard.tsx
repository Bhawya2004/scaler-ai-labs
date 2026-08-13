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
    <div className="group relative flex flex-col justify-between rounded-2xl border border-surface-200 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:border-surface-800 dark:bg-surface-900 dark:hover:border-brand-700">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="rounded-md border border-brand-200 bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700 dark:border-brand-700/80 dark:bg-brand-900/60 dark:text-brand-200">
              {meeting.meeting_type}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-medium text-surface-400 dark:text-surface-300">
              <Clock className="h-3 w-3" />
              {formatDuration(meeting.duration_seconds)}
            </span>
          </div>

          {/* Quick Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen(!menuOpen);
              }}
              className="rounded-lg p-1 text-surface-400 opacity-0 transition-opacity hover:bg-surface-100 hover:text-surface-600 group-hover:opacity-100 dark:hover:bg-surface-800"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)}></div>
                <div className="absolute right-0 top-7 z-30 w-36 rounded-xl border border-surface-200 bg-white p-1.5 shadow-xl dark:border-surface-800 dark:bg-surface-800 animate-slide-up">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(meeting);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-100 dark:text-surface-200 dark:hover:bg-surface-700"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit Metadata</span>
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(meeting);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Meeting Title Link */}
        <Link href={`/meetings/${meeting.id}`} className="mt-3 block group-hover:text-brand-600 dark:group-hover:text-brand-400">
          <h3 className="font-heading text-base font-bold text-surface-900 transition-colors line-clamp-1 dark:text-white">
            {meeting.title}
          </h3>
        </Link>

        {/* Date */}
        <p className="mt-1 flex items-center gap-1.5 text-xs text-surface-500">
          <Calendar className="h-3.5 w-3.5" />
          {formatMeetingDate(meeting.meeting_date)}
        </p>

        {/* AI Summary Overview */}
        <p className="mt-3 text-xs leading-relaxed text-surface-600 line-clamp-2 dark:text-surface-300">
          {meeting.summary_overview || 'AI Summary generated with structured takeaways, action items, and chapters.'}
        </p>
      </div>

      {/* Footer Details */}
      <div className="mt-5 pt-4 border-t border-surface-100 dark:border-surface-800">
        <div className="flex items-center justify-between">
          {/* Speaker Avatars Stack */}
          <div className="flex items-center -space-x-1.5">
            {participantsList.slice(0, 4).map((name, i) => {
              const style = getSpeakerStyle(name);
              return (
                <div
                  key={i}
                  title={name}
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold border-2 border-white shadow-xs dark:border-surface-900 ${style.bg} ${style.text}`}
                >
                  {getInitials(name)}
                </div>
              );
            })}
            {participantsList.length > 4 && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-200 text-[10px] font-bold text-surface-600 border-2 border-white dark:bg-surface-800 dark:text-surface-300 dark:border-surface-900">
                +{participantsList.length - 4}
              </div>
            )}
          </div>

          {/* Badges & Play CTA */}
          <Link href={`/meetings/${meeting.id}`} className="flex items-center gap-3">
            {/* Action items badge */}
            {meeting.action_items_count > 0 && (
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckSquare className="h-3.5 w-3.5" />
                <span>{meeting.action_items_count}</span>
              </div>
            )}

            {/* Play CTA indicator */}
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition-transform group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white dark:bg-surface-800 dark:text-brand-300 dark:group-hover:bg-brand-600 dark:group-hover:text-white">
              <Play className="h-3 w-3 fill-current ml-0.5" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
