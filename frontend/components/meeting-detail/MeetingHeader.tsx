'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  Share2,
  Sparkles,
  Edit2,
  Trash2,
  Check,
  FileText,
  FileCode,
  FileDown,
  Loader2,
} from 'lucide-react';
import { MeetingDetail } from '@/lib/types';
import { formatDuration, formatMeetingDate, getSpeakerStyle, getInitials } from '@/lib/utils';
import { api } from '@/lib/api';

interface MeetingHeaderProps {
  meeting: MeetingDetail;
  onEdit: () => void;
  onDelete: () => void;
  onRegenerateSummary: () => void;
  regeneratingSummary: boolean;
}

export function MeetingHeader({
  meeting,
  onEdit,
  onDelete,
  onRegenerateSummary,
  regeneratingSummary,
}: MeetingHeaderProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 border-b border-surface-200 bg-white p-6 dark:border-surface-800 dark:bg-surface-900">
      {/* Top breadcrumb & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-semibold text-surface-500 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Library</span>
        </Link>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Regenerate AI Summary with Groq */}
          <button
            onClick={onRegenerateSummary}
            disabled={regeneratingSummary}
            className="flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 shadow-xs transition-all hover:bg-brand-100 disabled:opacity-50 dark:border-brand-900/50 dark:bg-brand-950/60 dark:text-brand-300"
          >
            {regeneratingSummary ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            <span>{regeneratingSummary ? 'Analyzing...' : 'Regenerate AI'}</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="flex items-center gap-1.5 rounded-xl border border-surface-200 bg-white px-3 py-1.5 text-xs font-semibold text-surface-700 shadow-xs hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-200"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </button>

            {exportOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setExportOpen(false)}></div>
                <div className="absolute right-0 top-9 z-30 w-48 rounded-2xl border border-surface-200 bg-white p-1.5 shadow-xl dark:border-surface-800 dark:bg-surface-800 animate-slide-up">
                  <a
                    href={api.getExportUrl(meeting.id, 'markdown')}
                    download
                    onClick={() => setExportOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-surface-700 hover:bg-surface-100 dark:text-surface-200 dark:hover:bg-surface-700"
                  >
                    <FileText className="h-3.5 w-3.5 text-purple-600" />
                    <span>Markdown (.md)</span>
                  </a>
                  <a
                    href={api.getExportUrl(meeting.id, 'txt')}
                    download
                    onClick={() => setExportOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-surface-700 hover:bg-surface-100 dark:text-surface-200 dark:hover:bg-surface-700"
                  >
                    <FileDown className="h-3.5 w-3.5 text-blue-600" />
                    <span>Plain Text (.txt)</span>
                  </a>
                  <a
                    href={api.getExportUrl(meeting.id, 'vtt')}
                    download
                    onClick={() => setExportOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-surface-700 hover:bg-surface-100 dark:text-surface-200 dark:hover:bg-surface-700"
                  >
                    <FileCode className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Captions (.vtt)</span>
                  </a>
                </div>
              </>
            )}
          </div>

          {/* Share / Copy link */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 rounded-xl border border-surface-200 bg-white px-3 py-1.5 text-xs font-semibold text-surface-700 shadow-xs hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-200"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied!' : 'Share'}</span>
          </button>

          {/* Edit */}
          <button
            onClick={onEdit}
            className="rounded-xl border border-surface-200 bg-white p-1.5 text-surface-600 shadow-xs hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300"
            title="Edit Meeting Metadata"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>

          {/* Delete */}
          <button
            onClick={onDelete}
            className="rounded-xl border border-surface-200 bg-white p-1.5 text-rose-600 shadow-xs hover:bg-rose-50 dark:border-surface-700 dark:bg-surface-800 dark:hover:bg-rose-950/50"
            title="Delete Meeting"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Title & Metadata Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
            {meeting.meeting_type || 'General'}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-surface-400">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(meeting.duration_seconds)}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-surface-400">
            <Calendar className="h-3.5 w-3.5" />
            {formatMeetingDate(meeting.meeting_date)}
          </span>
        </div>

        <h1 className="mt-2 font-heading text-2xl font-bold text-surface-900 dark:text-white">
          {meeting.title}
        </h1>

        {/* Participants Avatar Line */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-surface-400">Participants:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {(meeting.participants || []).map((name, i) => {
              const style = getSpeakerStyle(name);
              return (
                <div
                  key={i}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text} ${style.border}`}
                >
                  <span className="font-bold">{getInitials(name)}</span>
                  <span>{name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
