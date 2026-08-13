'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Clock, Calendar, CheckSquare, Edit2, Trash2 } from 'lucide-react';
import { MeetingListItem } from '@/lib/types';
import { formatDuration, formatMeetingDate, getSpeakerStyle, getInitials } from '@/lib/utils';

interface MeetingTableProps {
  meetings: MeetingListItem[];
  onEdit: (m: MeetingListItem) => void;
  onDelete: (m: MeetingListItem) => void;
}

export function MeetingTable({ meetings, onEdit, onDelete }: MeetingTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-xs dark:border-surface-800 dark:bg-surface-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-surface-200 bg-surface-50 text-[11px] font-semibold text-surface-500 uppercase dark:border-surface-800 dark:bg-surface-950 dark:text-surface-400">
            <tr>
              <th className="px-5 py-3.5">Meeting Name</th>
              <th className="px-4 py-3.5">Type</th>
              <th className="px-4 py-3.5">Date & Time</th>
              <th className="px-4 py-3.5">Duration</th>
              <th className="px-4 py-3.5">Participants</th>
              <th className="px-4 py-3.5">Action Items</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
            {meetings.map((meeting) => {
              const participantsList = Array.isArray(meeting.participants)
                ? meeting.participants
                : [];

              return (
                <tr
                  key={meeting.id}
                  className="group transition-colors hover:bg-surface-50/80 dark:hover:bg-surface-800/50"
                >
                  {/* Title */}
                  <td className="px-5 py-4">
                    <Link
                      href={`/meetings/${meeting.id}`}
                      className="font-medium text-surface-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400 font-semibold"
                    >
                      {meeting.title}
                    </Link>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-4">
                    <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                      {meeting.meeting_type || 'General'}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-4 text-surface-500 whitespace-nowrap">
                    {formatMeetingDate(meeting.meeting_date)}
                  </td>

                  {/* Duration */}
                  <td className="px-4 py-4 text-surface-600 dark:text-surface-300 font-medium whitespace-nowrap">
                    {formatDuration(meeting.duration_seconds)}
                  </td>

                  {/* Participants Avatar Stack */}
                  <td className="px-4 py-4">
                    <div className="flex items-center -space-x-1.5">
                      {participantsList.slice(0, 3).map((name, i) => {
                        const style = getSpeakerStyle(name);
                        return (
                          <div
                            key={i}
                            title={name}
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold border-2 border-white dark:border-surface-900 ${style.bg} ${style.text}`}
                          >
                            {getInitials(name)}
                          </div>
                        );
                      })}
                      {participantsList.length > 3 && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-200 text-[10px] font-bold text-surface-600 border-2 border-white dark:bg-surface-800 dark:text-surface-300 dark:border-surface-900">
                          +{participantsList.length - 3}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Action Items */}
                  <td className="px-4 py-4">
                    {meeting.action_items_count > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        <CheckSquare className="h-3 w-3" />
                        {meeting.action_items_count}
                      </span>
                    ) : (
                      <span className="text-surface-400">—</span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/meetings/${meeting.id}`}
                        className="rounded-lg p-1.5 text-surface-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950 dark:hover:text-brand-300"
                        title="Open Meeting Room"
                      >
                        <Play className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => onEdit(meeting)}
                        className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 hover:text-surface-700 dark:hover:bg-surface-800 dark:hover:text-surface-200"
                        title="Edit Metadata"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(meeting)}
                        className="rounded-lg p-1.5 text-surface-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
                        title="Delete Meeting"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
