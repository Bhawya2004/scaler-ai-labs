'use client';

import React from 'react';
import Link from 'next/link';
import { Edit2, Trash2, Video } from 'lucide-react';
import { MeetingListItem } from '@/lib/types';
import { formatMeetingDate } from '@/lib/utils';

interface MeetingTableProps {
  meetings: MeetingListItem[];
  onEdit: (m: MeetingListItem) => void;
  onDelete: (m: MeetingListItem) => void;
}

export function MeetingTable({ meetings, onEdit, onDelete }: MeetingTableProps) {
  return (
    <div className="flex flex-col gap-2.5 w-full">
      {meetings.map((meeting) => {
        return (
          <div
            key={meeting.id}
            className="group flex items-center justify-between rounded-xl border border-line bg-white p-3 hover:bg-surface-sunken transition-all cursor-pointer dark:border-surface-800 dark:bg-surface-900"
          >
            <Link href={`/meetings/${meeting.id}`} className="flex items-center gap-3.5 flex-1 min-w-0">
              {/* Pink Fireflies Butterfly Logo Mark Icon on Left */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-pink-500 to-rose-600 shadow-xs">
                {/* Custom Butterfly shape */}
                <div className="relative flex h-4.5 w-4.5 items-center justify-center">
                  <span className="absolute left-0.5 top-0.5 h-2 w-2 rounded-full bg-white opacity-95" />
                  <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-white opacity-80" />
                  <span className="absolute left-1.5 bottom-0.5 h-1.5 w-1.5 rounded-full bg-white opacity-70" />
                </div>
              </div>
              
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-ink-900 dark:text-white group-hover:text-brand-500 transition-colors truncate">
                  {meeting.title}
                </span>
                <span className="text-[10px] text-ink-400 mt-0.5 font-bold">
                  {formatMeetingDate(meeting.meeting_date)}
                </span>
              </div>
            </Link>

            {/* Actions / Options on the Right */}
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onEdit(meeting);
                }}
                className="opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-ink-600 hover:bg-white dark:hover:bg-surface-800 transition-opacity"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(meeting);
                }}
                className="opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-accent-red hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-opacity"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
