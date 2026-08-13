'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Sparkles,
  Loader2,
  RefreshCw,
  Play,
  Calendar,
  Upload,
  ChevronRight,
  HelpCircle,
  Video,
  Settings,
} from 'lucide-react';
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
import Link from 'next/link';

export default function DashboardPage() {
  const { viewMode, user, setComingSoonFeature } = useAppStore();

  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [analytics, setAnalytics] = useState<GlobalAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [sortBy, setSortBy] = useState('-meeting_date');

  // Tab state
  const [activeTab, setActiveTab] = useState<'recent' | 'upcoming' | 'ai_feed'>('recent');

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
      toast.error('Could not connect to Django backend.');
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
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 md:px-0">
      {/* 1. Welcome Aboard Hero Banner */}
      <div className="rounded-2xl border border-[#F3EFE9] bg-gradient-to-r from-[#FCF9F5] via-[#FFFBF6] to-[#FFF7EE] p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 dark:border-surface-800 dark:from-surface-900 dark:via-surface-900 dark:to-surface-950">
        <div className="flex-1">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-3xl">
            Welcome Aboard, {user?.name?.split(' ')[0] || 'Bhawya'}!
          </h1>
          <p className="mt-2 text-xs text-ink-600 dark:text-surface-300 leading-relaxed max-w-md">
            Fireflies is now ready to automate your meetings and streamline your workflows.
          </p>
        </div>
        
        {/* Mock video frame from the screenshot */}
        <div 
          onClick={() => setComingSoonFeature('Product Demo Video')}
          className="relative w-64 h-36 shrink-0 rounded-2xl overflow-hidden bg-gradient-to-tr from-purple-800 to-indigo-900 shadow-md border border-line flex items-center justify-center cursor-pointer hover:scale-102 transition-transform"
        >
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-md text-[9px] font-bold text-white">
            <span>Fireflies</span>
            <div className="w-1 h-1 rounded-full bg-pink-500"></div>
            <span>Product Demo</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white shadow-md">
            <Play className="h-4.5 w-4.5 fill-current ml-0.5" />
          </div>
          <div className="absolute bottom-2 left-2 h-5 w-5 rounded-full bg-brand-100 flex items-center justify-center border border-white text-[8px] font-bold text-brand-600">
            BG
          </div>
        </div>
      </div>

      {/* 2. Quick Start Panel */}
      <div>
        <h2 className="text-sm font-bold text-ink-900 dark:text-white">Quick Start</h2>
        <p className="text-xs text-ink-600 dark:text-surface-400">Capture your first meeting or upload a recording to see Fireflies in action.</p>
        
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Card 1: Schedule Meeting */}
          <div 
            onClick={() => setComingSoonFeature('Schedule Meeting')}
            className="flex items-center justify-between rounded-xl border border-[#FEE2EC] bg-[#FFF5F8] p-4 cursor-pointer hover:bg-[#FFEBF1] transition-all dark:bg-surface-900 dark:border-surface-800"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
                <Calendar className="h-4.5 w-4.5" />
              </div>
              <span className="text-xs font-bold text-[#E33574] dark:text-pink-300">Schedule Meeting</span>
            </div>
            <ChevronRight className="h-4 w-4 text-pink-400" />
          </div>

          {/* Card 2: Upload File */}
          <div 
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center justify-between rounded-xl border border-[#C5F3E4] bg-[#E8FAF4] p-4 cursor-pointer hover:bg-[#D7F7EB] transition-all dark:bg-surface-900 dark:border-surface-800"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Upload className="h-4.5 w-4.5" />
              </div>
              <span className="text-xs font-bold text-[#1F7A5E] dark:text-emerald-300">Upload File</span>
            </div>
            <ChevronRight className="h-4 w-4 text-emerald-400" />
          </div>

          {/* Card 3: Capture Meeting */}
          <div 
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center justify-between rounded-xl border border-[#D5D3FA] bg-[#EEEDFC] p-4 cursor-pointer hover:bg-[#E3E1FB] transition-all dark:bg-surface-900 dark:border-surface-800"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-500">
                <Video className="h-4.5 w-4.5" />
              </div>
              <span className="text-xs font-bold text-brand-600 dark:text-brand-300">Capture Meeting</span>
            </div>
            <ChevronRight className="h-4 w-4 text-brand-400" />
          </div>
        </div>
      </div>

      {/* 3. Stats Section */}
      <DashboardStats analytics={analytics} />

      {/* 4. Tab Navigation and Filter Controls */}
      <div className="border-t border-line pt-6 dark:border-surface-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Recent, Upcoming, AI Feed Tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-surface-sunken p-1 dark:bg-surface-900">
            <button
              onClick={() => setActiveTab('recent')}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'recent'
                  ? 'bg-white text-ink-900 shadow-sm dark:bg-surface-800 dark:text-white'
                  : 'text-ink-600 hover:text-ink-900 dark:text-surface-400'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setComingSoonFeature('Upcoming Meetings Tab')}
              className="rounded-lg px-4 py-1.5 text-xs font-semibold text-ink-600 hover:text-ink-900 dark:text-surface-400"
            >
              Upcoming
            </button>
            <button
              onClick={() => setComingSoonFeature('AI Feed Tab')}
              className="rounded-lg px-4 py-1.5 text-xs font-semibold text-ink-600 hover:text-ink-900 dark:text-surface-400"
            >
              AI Feed
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-line bg-white px-3 text-xs font-semibold text-ink-600 hover:bg-surface-sunken dark:border-surface-700 dark:bg-surface-800 dark:text-white"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>
            <button
              onClick={() => setComingSoonFeature('List Settings')}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-white text-ink-600 hover:bg-surface-sunken dark:border-surface-700 dark:bg-surface-800"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Dashboard Filters (Search, Category Pills, Sort) */}
        <div className="mt-4">
          <DashboardFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>
      </div>

      {/* 5. Main Meetings Listing Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 text-center text-ink-400">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500 mb-3" />
          <p className="text-xs font-semibold text-ink-900 dark:text-white">
            Syncing workspace data...
          </p>
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
        /* Table / List Layout */
        <MeetingTable
          meetings={filteredMeetings}
          onEdit={(m) => setEditMeeting(m)}
          onDelete={(m) => setDeleteMeeting(m)}
        />
      )}

      {/* 6. Floating help widget bottom right */}
      <button
        onClick={() => setComingSoonFeature('Help & FAQ Center')}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg hover:bg-brand-600 transition-transform active:scale-95"
      >
        <HelpCircle className="h-6 w-6" />
      </button>

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
