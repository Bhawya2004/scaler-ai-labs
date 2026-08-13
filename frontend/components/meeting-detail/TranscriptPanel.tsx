'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TranscriptSegment } from '@/lib/types';
import { TranscriptLine } from './TranscriptLine';
import { TranscriptSearch } from './TranscriptSearch';
import { usePlayerStore } from '@/lib/store';
import { MessageSquare, ArrowDownCircle } from 'lucide-react';

interface TranscriptPanelProps {
  segments: TranscriptSegment[];
  onAddComment?: (segmentId: string) => void;
}

export function TranscriptPanel({ segments, onAddComment }: TranscriptPanelProps) {
  const { currentTime, activeSegmentId, setActiveSegmentId, isPlaying } = usePlayerStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState('All');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Extract unique speaker names
  const speakers = useMemo(() => {
    return Array.from(new Set(segments.map((s) => s.speaker_name).filter(Boolean)));
  }, [segments]);

  // Synchronize active segment based on audio currentTime
  useEffect(() => {
    const current = segments.find(
      (s) => currentTime >= s.start_time && currentTime <= s.end_time
    );

    if (current && current.id !== activeSegmentId) {
      setActiveSegmentId(current.id);

      // Auto-scroll to active segment if enabled and playing
      if (autoScroll && isPlaying) {
        const el = document.getElementById(`transcript-segment-${current.id}`);
        if (el && containerRef.current) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [currentTime, segments, activeSegmentId, setActiveSegmentId, autoScroll, isPlaying]);

  // Filter segments by search query & selected speaker
  const filteredSegments = useMemo(() => {
    return segments.filter((s) => {
      const matchSpeaker = selectedSpeaker === 'All' || s.speaker_name === selectedSpeaker;
      const matchSearch =
        !searchQuery.trim() ||
        s.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.speaker_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSpeaker && matchSearch;
    });
  }, [segments, selectedSpeaker, searchQuery]);

  // Matching segments list for Next / Prev navigation
  const matchingSegments = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return segments.filter(
      (s) =>
        s.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.speaker_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [segments, searchQuery]);

  // Handle Next match navigation
  const handleNextMatch = () => {
    if (matchingSegments.length === 0) return;
    const nextIdx = (currentMatchIndex + 1) % matchingSegments.length;
    setCurrentMatchIndex(nextIdx);
    const targetSeg = matchingSegments[nextIdx];
    const el = document.getElementById(`transcript-segment-${targetSeg.id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Handle Prev match navigation
  const handlePrevMatch = () => {
    if (matchingSegments.length === 0) return;
    const prevIdx = (currentMatchIndex - 1 + matchingSegments.length) % matchingSegments.length;
    setCurrentMatchIndex(prevIdx);
    const targetSeg = matchingSegments[prevIdx];
    const el = document.getElementById(`transcript-segment-${targetSeg.id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(31,32,51,0.04)] dark:border-surface-800 dark:bg-surface-900">
      {/* Search Header */}
      <div className="p-4 border-b border-line dark:border-surface-800">
        <TranscriptSearch
          query={searchQuery}
          onQueryChange={(q) => {
            setSearchQuery(q);
            setCurrentMatchIndex(0);
          }}
          matchCount={matchingSegments.length}
          currentMatchIndex={currentMatchIndex}
          onNextMatch={handleNextMatch}
          onPrevMatch={handlePrevMatch}
          speakers={speakers}
          selectedSpeaker={selectedSpeaker}
          onSpeakerChange={setSelectedSpeaker}
        />
      </div>

      {/* Transcript Scrollable Body */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-1.5 max-h-[620px]"
      >
        {filteredSegments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-surface-400">
            <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-xs font-semibold">No transcript lines found</p>
            <p className="text-[11px] mt-0.5">Try clearing your search query or speaker filter.</p>
          </div>
        ) : (
          filteredSegments.map((seg) => (
            <TranscriptLine
              key={seg.id}
              segment={seg}
              isActive={activeSegmentId === seg.id}
              searchQuery={searchQuery}
              onAddComment={onAddComment}
            />
          ))
        )}
      </div>

      {/* Auto-scroll Status Bar */}
      <div className="flex items-center justify-between border-t border-surface-100 bg-surface-50 px-4 py-2 text-[11px] text-surface-400 dark:border-surface-800 dark:bg-surface-950">
        <span>{filteredSegments.length} speech segments</span>
        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={`flex items-center gap-1 font-semibold transition-colors ${
            autoScroll ? 'text-brand-600 dark:text-brand-400' : 'text-surface-400'
          }`}
        >
          <ArrowDownCircle className="h-3.5 w-3.5" />
          <span>Auto-scroll: {autoScroll ? 'ON' : 'OFF'}</span>
        </button>
      </div>
    </div>
  );
}
