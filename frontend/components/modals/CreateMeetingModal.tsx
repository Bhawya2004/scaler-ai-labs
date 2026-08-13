'use client';

import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Music,
} from 'lucide-react';
import { api } from '@/lib/api';
import { CreateMeetingPayload, MeetingDetail } from '@/lib/types';

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (meeting: MeetingDetail) => void;
}

const SAMPLE_TRANSCRIPT = `[00:00] Maya Lin (Design Lead): Welcome team! Today we are reviewing the new Fireflies design system and AI chat workflows.
[00:20] Liam Foster (Frontend Lead): Thanks Maya. We have built the two-way transcript seek synchronization and optimistic action items in Next.js.
[00:45] Chloe Zhang (UI Engineer): I also added the color-tagged comments and high-contrast dark mode.
[01:10] Maya Lin (Design Lead): Excellent. Let's make sure we test the Groq LLM summary extraction and export features before submission.
[01:30] Liam Foster (Frontend Lead): I will finalize the documentation and run the automated test suite.`;

export function CreateMeetingModal({ isOpen, onClose, onSuccess }: CreateMeetingModalProps) {
  const [tab, setTab] = useState<'paste' | 'upload'>('paste');
  const [title, setTitle] = useState('');
  const [meetingType, setMeetingType] = useState('Product');
  const [participants, setParticipants] = useState('Maya Lin, Liam Foster, Chloe Zhang');
  const [audioUrl, setAudioUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4');
  const [transcriptContent, setTranscriptContent] = useState(SAMPLE_TRANSCRIPT);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [autoSummary, setAutoSummary] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a meeting title.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const participantList = participants
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      let createdMeeting: MeetingDetail;

      if (tab === 'upload' && uploadedFile) {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('meeting_type', meetingType);
        formData.append('participants', JSON.stringify(participantList));
        formData.append('audio_url', audioUrl);
        formData.append('transcript_file', uploadedFile);
        formData.append('auto_generate_summary', String(autoSummary));
        createdMeeting = await api.createMeeting(formData);
      } else {
        const payload: CreateMeetingPayload = {
          title,
          meeting_type: meetingType,
          participants: participantList,
          audio_url: audioUrl,
          transcript_content: transcriptContent,
          auto_generate_summary: autoSummary,
        };
        createdMeeting = await api.createMeeting(payload);
      }

      onSuccess(createdMeeting);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create meeting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
      <div
        className="flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-2xl dark:border-surface-800 dark:bg-surface-900 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-surface-200 px-6 py-4 dark:border-surface-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-surface-900 dark:text-white">
                New Meeting & Transcript
              </h3>
              <p className="text-xs text-surface-500">
                Upload or paste meeting transcript for AI analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 overflow-y-auto max-h-[80vh]">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Meeting Title & Category */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300">
                Meeting Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Q3 AI Features Roadmap Review"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 h-9 w-full rounded-xl border border-surface-200 bg-white px-3 text-xs text-surface-900 placeholder:text-surface-400 focus:border-brand-500 focus:outline-hidden dark:border-surface-700 dark:bg-surface-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300">
                Category
              </label>
              <select
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value)}
                className="mt-1 h-9 w-full rounded-xl border border-surface-200 bg-white px-3 text-xs text-surface-900 focus:border-brand-500 focus:outline-hidden dark:border-surface-700 dark:bg-surface-800 dark:text-white"
              >
                <option value="Product">Product</option>
                <option value="Engineering">Engineering</option>
                <option value="Sales">Sales</option>
                <option value="Design">Design</option>
                <option value="Leadership">Leadership</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          {/* Participants */}
          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300">
              Participants (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Sarah Connor, Alex Rivera, Priya Sharma"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              className="mt-1 h-9 w-full rounded-xl border border-surface-200 bg-white px-3 text-xs text-surface-900 placeholder:text-surface-400 focus:border-brand-500 focus:outline-hidden dark:border-surface-700 dark:bg-surface-800 dark:text-white"
            />
          </div>

          {/* Audio Placeholder URL */}
          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300">
              Sample Audio / Video URL (Optional)
            </label>
            <input
              type="text"
              placeholder="https://..."
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              className="mt-1 h-9 w-full rounded-xl border border-surface-200 bg-white px-3 text-xs text-surface-900 placeholder:text-surface-400 focus:border-brand-500 focus:outline-hidden dark:border-surface-700 dark:bg-surface-800 dark:text-white font-mono text-[11px]"
            />
          </div>

          {/* Input Method Switcher */}
          <div className="mt-1 flex rounded-xl border border-surface-200 bg-surface-100 p-1 dark:border-surface-800 dark:bg-surface-950">
            <button
              type="button"
              onClick={() => setTab('paste')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                tab === 'paste'
                  ? 'bg-white text-brand-600 shadow-xs dark:bg-surface-800 dark:text-brand-400'
                  : 'text-surface-500 hover:text-surface-800 dark:text-surface-400'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Paste Text / JSON</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('upload')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                tab === 'upload'
                  ? 'bg-white text-brand-600 shadow-xs dark:bg-surface-800 dark:text-brand-400'
                  : 'text-surface-500 hover:text-surface-800 dark:text-surface-400'
              }`}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload File (.txt, .vtt, .srt, .json)</span>
            </button>
          </div>

          {/* Tab 1: Paste Text */}
          {tab === 'paste' ? (
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300">
                  Transcript Dialogue
                </label>
                <button
                  type="button"
                  onClick={() => setTranscriptContent(SAMPLE_TRANSCRIPT)}
                  className="text-[11px] font-medium text-brand-600 hover:underline dark:text-brand-400"
                >
                  Load Sample Transcript
                </button>
              </div>
              <textarea
                rows={5}
                value={transcriptContent}
                onChange={(e) => setTranscriptContent(e.target.value)}
                placeholder="[00:00] Speaker Name: Spoken message here..."
                className="mt-1 w-full rounded-xl border border-surface-200 bg-white p-3 font-mono text-xs text-surface-900 placeholder:text-surface-400 focus:border-brand-500 focus:outline-hidden dark:border-surface-700 dark:bg-surface-800 dark:text-white"
              />
              <p className="mt-1 text-[11px] text-surface-400">
                Supports formats like <code className="text-brand-600">[00:15] Name: Message</code>, VTT, SRT, or raw paragraphs.
              </p>
            </div>
          ) : (
            /* Tab 2: Upload File */
            <div>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-surface-300 bg-surface-50/50 p-6 text-center hover:border-brand-400 dark:border-surface-700 dark:bg-surface-800/30"
              >
                <Upload className="h-8 w-8 text-brand-600 dark:text-brand-400" />
                <p className="mt-2 text-xs font-semibold text-surface-700 dark:text-surface-200">
                  {uploadedFile ? uploadedFile.name : 'Drag & drop your transcript file here'}
                </p>
                <p className="mt-0.5 text-[11px] text-surface-400">
                  Supports .txt, .vtt, .srt, and .json
                </p>
                <label className="mt-3 cursor-pointer rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-brand-600 shadow-xs border border-surface-200 hover:bg-surface-50 dark:bg-surface-800 dark:border-surface-700 dark:text-brand-400">
                  Browse Files
                  <input
                    type="file"
                    accept=".txt,.vtt,.srt,.json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Auto AI Summary Toggle */}
          <div className="flex items-center gap-2.5 rounded-xl border border-brand-200 bg-brand-50/60 p-3 dark:border-brand-900/40 dark:bg-brand-950/30">
            <input
              type="checkbox"
              id="autoSummary"
              checked={autoSummary}
              onChange={(e) => setAutoSummary(e.target.checked)}
              className="h-4 w-4 rounded-sm border-brand-400 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="autoSummary" className="cursor-pointer text-xs font-medium text-surface-800 dark:text-surface-200">
              <span className="font-semibold text-brand-700 dark:text-brand-300">Auto-generate AI Summary & Action Items</span>
              <span className="block text-[11px] text-surface-500">Calls Groq LLM (LLaMA 3.3) to extract overview, key points, and chapter outlines.</span>
            </label>
          </div>

          {/* Modal Footer CTA */}
          <div className="mt-2 flex items-center justify-end gap-2.5 pt-3 border-t border-surface-100 dark:border-surface-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-surface-200 bg-white px-4 py-2 text-xs font-semibold text-surface-700 hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-brand-600/20 hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing & Summarizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Create & Process Meeting</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
