'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { MeetingListItem, GlobalAnalytics } from '@/lib/types';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { MeetingCard } from '@/components/dashboard/MeetingCard';
import { MeetingTable } from '@/components/dashboard/MeetingTable';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { CreateMeetingModal } from '@/components/modals/CreateMeetingModal';
import { EditMeetingModal } from '@/components/modals/EditMeetingModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { viewMode } = useAppStore();

  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [analytics, setAnalytics] = useState<GlobalAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [sortBy, setSortBy] = useState('-meeting_date');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editMeeting, setEditMeeting] = useState<MeetingListItem | null>(null);
  const [deleteMeeting, setDeleteMeeting] = useState<MeetingListItem | null>(null);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [meetingsData, analyticsData] = await Promise.all([
        api.getMeetings({ ordering: sortBy }),
        api.getGlobalAnalytics().catch(() => null),
      ]);
      setMeetings(meetingsData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to load meetings:', err);
      toast.error('Could not connect to Django backend. Is the backend running on port 8000?');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sortBy]);

  // Client-side search and category filtering
  const filteredMeetings = useMemo(() => {
    return meetings.filter((m) => {
      const matchesType = selectedType === 'All' || m.meeting_type === selectedType;
      const matchesSearch =
        !searchQuery.trim() ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(m.participants) &&
          m.participants.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        (m.summary_overview && m.summary_overview.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesType && matchesSearch;
    });
  }, [meetings, selectedType, searchQuery]);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Top Banner & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-surface-900 dark:text-white sm:text-3xl">
              Meetings Library
            </h1>
            <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              {meetings.length} Total
            </span>
          </div>
          <p className="mt-1 text-xs text-surface-500">
            Browse interactive transcripts, AI-generated summaries, and action items.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-xl border border-surface-200 bg-white px-3.5 py-2 text-xs font-semibold text-surface-700 shadow-xs hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-800 dark:text-white dark:hover:bg-surface-700"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-600/20 transition-all hover:bg-brand-700 hover:shadow-lg active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Upload Meeting</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Stats Bar */}
      <DashboardStats analytics={analytics} />

      {/* Search, Filter, Category & Sort Bar */}
      <DashboardFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Main Meetings Listing Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 text-center text-surface-400">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600 dark:text-brand-400 mb-3" />
          <p className="text-xs font-semibold text-surface-700 dark:text-surface-300">
            Connecting to Django Backend...
          </p>
          <p className="text-[11px] mt-0.5 text-surface-400">Fetching meetings from SQLite database.</p>
        </div>
      ) : filteredMeetings.length === 0 ? (
        <EmptyState
          isSearch={Boolean(searchQuery.trim() || selectedType !== 'All')}
          onClearFilters={() => {
            setSearchQuery('');
            setSelectedType('All');
          }}
          onNewMeeting={() => setCreateModalOpen(true)}
          onLoadDemo={async () => {
            try {
              toast.loading('Generating sample meeting with AI summary...', { id: 'seed' });
              await api.seedDemo();
              toast.success('Sample meeting loaded!', { id: 'seed' });
              loadData(true);
            } catch (err: any) {
              toast.error(`Could not seed demo: ${err.message}`, { id: 'seed' });
            }
          }}
        />
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredMeetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onEdit={(m) => setEditMeeting(m)}
              onDelete={(m) => setDeleteMeeting(m)}
            />
          ))}
        </div>
      ) : (
        /* Table Layout */
        <MeetingTable
          meetings={filteredMeetings}
          onEdit={(m) => setEditMeeting(m)}
          onDelete={(m) => setDeleteMeeting(m)}
        />
      )}

      {/* Create Modal */}
      <CreateMeetingModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={(created) => {
          toast.success(`Meeting "${created.title}" processed with Groq AI!`);
          loadData(true);
        }}
      />

      {/* Edit Modal */}
      <EditMeetingModal
        isOpen={Boolean(editMeeting)}
        meeting={editMeeting}
        onClose={() => setEditMeeting(null)}
        onSuccess={() => {
          toast.success('Meeting metadata updated!');
          loadData(true);
        }}
      />

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteMeeting)}
        meetingId={deleteMeeting?.id || null}
        meetingTitle={deleteMeeting?.title || ''}
        onClose={() => setDeleteMeeting(null)}
        onSuccess={() => {
          if (deleteMeeting) {
            setMeetings(meetings.filter((m) => m.id !== deleteMeeting.id));
            toast.success('Meeting deleted successfully');
          }
        }}
      />
    </div>
  );
}
