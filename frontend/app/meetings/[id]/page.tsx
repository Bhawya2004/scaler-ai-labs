'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  FileText,
  CheckSquare,
  Bookmark,
  MessageSquare,
  Bot,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { api } from '@/lib/api';
import { MeetingDetail, ActionItem, Comment, ChatMessage } from '@/lib/types';
import { MeetingHeader } from '@/components/meeting-detail/MeetingHeader';
import { MediaPlayer } from '@/components/meeting-detail/MediaPlayer';
import { TranscriptPanel } from '@/components/meeting-detail/TranscriptPanel';
import { TalkTimeAnalytics } from '@/components/meeting-detail/TalkTimeAnalytics';
import { SummaryTab } from '@/components/summary/SummaryTab';
import { ActionItemsTab } from '@/components/summary/ActionItemsTab';
import { ChaptersTab } from '@/components/summary/ChaptersTab';
import { NotesTab } from '@/components/summary/NotesTab';
import { AskAITab } from '@/components/summary/AskAITab';
import { EditMeetingModal } from '@/components/modals/EditMeetingModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { CommentDialog } from '@/components/meeting-detail/CommentDialog';
import { usePlayerStore } from '@/lib/store';
import { toast } from 'sonner';

type ActiveTab = 'summary' | 'action_items' | 'chapters' | 'notes' | 'ask_ai';

function MeetingDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const meetingId = params.id as string;

  const { seekTo, resetPlayer } = usePlayerStore();

  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('summary');
  const [regeneratingSummary, setRegeneratingSummary] = useState(false);

  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);

  // Load meeting detail and talk time analytics
  const loadMeeting = async () => {
    try {
      const [detailData, analyticsData] = await Promise.all([
        api.getMeetingDetail(meetingId),
        api.getMeetingAnalytics(meetingId).catch(() => null),
      ]);
      setMeeting(detailData);
      setAnalytics(analyticsData);

      // Check if URL has timestamp query ?t=12.5
      const timeParam = searchParams.get('t');
      if (timeParam) {
        const targetTime = parseFloat(timeParam);
        if (!isNaN(targetTime)) {
          setTimeout(() => seekTo(targetTime), 200);
        }
      }
    } catch (err: any) {
      console.error('Failed to load meeting detail:', err);
      toast.error('Could not load meeting details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (meetingId) {
      loadMeeting();
    }
    return () => {
      resetPlayer();
    };
  }, [meetingId]);

  // Handle Groq AI summary regeneration
  const handleRegenerateSummary = async () => {
    setRegeneratingSummary(true);
    try {
      const updated = await api.regenerateSummary(meetingId, false);
      setMeeting(updated);
      toast.success('AI Summary & Key Takeaways updated via Groq!');
    } catch (err: any) {
      toast.error(`Regeneration failed: ${err.message || 'Check Groq API connection'}`);
    } finally {
      setRegeneratingSummary(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center text-surface-400">
        <Loader2 className="h-9 w-9 animate-spin text-brand-600 dark:text-brand-400 mb-3" />
        <h3 className="font-heading text-base font-bold text-surface-800 dark:text-surface-200">
          Loading Interactive Meeting Room...
        </h3>
        <p className="text-xs text-surface-400 mt-1">Preparing transcripts and AI intelligence.</p>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center text-surface-400">
        <p className="text-sm font-semibold text-surface-700 dark:text-surface-300">
          Meeting not found
        </p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700"
        >
          Return to Library
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Top Meeting Header */}
      <MeetingHeader
        meeting={meeting}
        onEdit={() => setEditModalOpen(true)}
        onDelete={() => setDeleteModalOpen(true)}
        onRegenerateSummary={handleRegenerateSummary}
        regeneratingSummary={regeneratingSummary}
      />

      {/* Media Player Bar */}
      <MediaPlayer
        audioUrl={meeting.audio_url}
        totalDuration={meeting.duration_seconds}
      />

      {/* Speaker Talk Time Analytics Bar */}
      {analytics && analytics.talk_time_breakdown && (
        <TalkTimeAnalytics talkTimeBreakdown={analytics.talk_time_breakdown} />
      )}

      {/* Two-Column Split Layout: Transcript (Left) + Intelligence Panels (Right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Interactive Transcript (7 cols on large screens) */}
        <div className="lg:col-span-7 h-[680px]">
          <TranscriptPanel
            segments={meeting.transcript_segments || []}
            onAddComment={(segmentId) => {
              setSelectedSegmentId(segmentId);
              setCommentDialogOpen(true);
            }}
          />
        </div>

        {/* Right Column: Tabbed Intelligence Panels (5 cols on large screens) */}
        <div className="lg:col-span-5 flex flex-col h-[680px] rounded-2xl border border-surface-200 bg-white shadow-xs dark:border-surface-800 dark:bg-surface-900">
          {/* Tab Navigation Headers */}
          <div className="flex items-center gap-1 border-b border-surface-100 p-2 dark:border-surface-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'summary'
                  ? 'bg-brand-50 text-brand-700 shadow-xs dark:bg-brand-950 dark:text-brand-300'
                  : 'text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Summary</span>
            </button>

            <button
              onClick={() => setActiveTab('action_items')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'action_items'
                  ? 'bg-brand-50 text-brand-700 shadow-xs dark:bg-brand-950 dark:text-brand-300'
                  : 'text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800'
              }`}
            >
              <CheckSquare className="h-3.5 w-3.5" />
              <span>Action Items ({meeting.action_items?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('chapters')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'chapters'
                  ? 'bg-brand-50 text-brand-700 shadow-xs dark:bg-brand-950 dark:text-brand-300'
                  : 'text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span>Chapters ({meeting.chapters?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'notes'
                  ? 'bg-brand-50 text-brand-700 shadow-xs dark:bg-brand-950 dark:text-brand-300'
                  : 'text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Notes ({meeting.comments?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('ask_ai')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'ask_ai'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950'
              }`}
            >
              <Bot className="h-3.5 w-3.5" />
              <span>Ask AI</span>
            </button>
          </div>

          {/* Active Tab Panel Body */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'summary' && (
              <SummaryTab
                summary={meeting.summary}
                onRegenerate={handleRegenerateSummary}
              />
            )}

            {activeTab === 'action_items' && (
              <ActionItemsTab
                meetingId={meeting.id}
                actionItems={meeting.action_items || []}
                onActionItemsChange={(items) =>
                  setMeeting({ ...meeting, action_items: items })
                }
              />
            )}

            {activeTab === 'chapters' && (
              <ChaptersTab chapters={meeting.chapters || []} />
            )}

            {activeTab === 'notes' && (
              <NotesTab
                comments={meeting.comments || []}
                onAddNote={() => {
                  setSelectedSegmentId(null);
                  setCommentDialogOpen(true);
                }}
                onCommentsChange={(comments) =>
                  setMeeting({ ...meeting, comments })
                }
              />
            )}

            {activeTab === 'ask_ai' && (
              <AskAITab
                meetingId={meeting.id}
                chatMessages={meeting.chat_messages || []}
                onMessagesChange={(chat_messages) =>
                  setMeeting({ ...meeting, chat_messages })
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* Edit Metadata Modal */}
      <EditMeetingModal
        isOpen={editModalOpen}
        meeting={meeting}
        onClose={() => setEditModalOpen(false)}
        onSuccess={(updated) => {
          setMeeting({ ...meeting, ...updated });
          toast.success('Meeting updated!');
        }}
      />

      {/* Delete Meeting Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        meetingId={meeting.id}
        meetingTitle={meeting.title}
        onClose={() => setDeleteModalOpen(false)}
        onSuccess={() => {
          toast.success('Meeting deleted');
          router.push('/');
        }}
      />

      {/* Add Note / Comment Modal */}
      <CommentDialog
        isOpen={commentDialogOpen}
        meetingId={meeting.id}
        segmentId={selectedSegmentId}
        onClose={() => {
          setCommentDialogOpen(false);
          setSelectedSegmentId(null);
        }}
        onSuccess={(newComment) => {
          setMeeting({
            ...meeting,
            comments: [newComment, ...(meeting.comments || [])],
          });
          toast.success('Note added!');
        }}
      />
    </div>
  );
}

export default function MeetingDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] flex-col items-center justify-center text-center text-surface-400">
          <Loader2 className="h-9 w-9 animate-spin text-brand-600 dark:text-brand-400 mb-3" />
          <h3 className="font-heading text-base font-bold text-surface-800 dark:text-surface-200">
            Loading Meeting Workspace...
          </h3>
        </div>
      }
    >
      <MeetingDetailContent />
    </Suspense>
  );
}
