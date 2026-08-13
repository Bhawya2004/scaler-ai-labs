'use client';

import React from 'react';
import { Search, LayoutGrid, List, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface DashboardFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedType: string;
  onTypeChange: (t: string) => void;
  sortBy: string;
  onSortChange: (s: string) => void;
}

const MEETING_TYPES = ['All', 'Product', 'Engineering', 'Sales', 'Design', 'Leadership'];

export function DashboardFilters({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  sortBy,
  onSortChange,
}: DashboardFiltersProps) {
  const { viewMode, setViewMode } = useAppStore();

  return (
    <div className="flex flex-col gap-4">
      {/* Top Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative min-w-[260px] flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Filter meetings by title or participant..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 w-full rounded-xl border border-surface-200 bg-white pl-10 pr-4 text-sm text-surface-900 placeholder:text-surface-400 transition-all focus:border-brand-500 focus:outline-hidden dark:border-surface-800 dark:bg-surface-900 dark:text-white dark:focus:border-brand-400"
          />
        </div>

        {/* Right side Sort & View Mode controls */}
        <div className="flex items-center gap-2.5">
          {/* Sort Dropdown */}
          <div className="relative flex items-center">
            <ArrowUpDown className="absolute left-3 h-3.5 w-3.5 text-surface-400 dark:text-surface-300 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="h-10 appearance-none rounded-xl border border-surface-200 bg-white pl-9 pr-8 text-xs font-semibold text-surface-800 transition-all focus:border-brand-500 focus:outline-hidden dark:border-surface-700 dark:bg-surface-800 dark:text-white"
            >
              <option value="-meeting_date" className="dark:bg-surface-800 dark:text-white">Most Recent</option>
              <option value="meeting_date" className="dark:bg-surface-800 dark:text-white">Oldest</option>
              <option value="-duration_seconds" className="dark:bg-surface-800 dark:text-white">Longest Duration</option>
              <option value="duration_seconds" className="dark:bg-surface-800 dark:text-white">Shortest Duration</option>
              <option value="title" className="dark:bg-surface-800 dark:text-white">Title (A-Z)</option>
            </select>
          </div>

          {/* Grid / Table View Toggle */}
          <div className="flex rounded-xl border border-surface-200 bg-surface-100 p-1 dark:border-surface-800 dark:bg-surface-900">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={`rounded-lg p-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-brand-600 shadow-xs dark:bg-surface-800 dark:text-brand-400 font-semibold'
                  : 'text-surface-500 hover:text-surface-800 dark:text-surface-400'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              aria-label="Table view"
              className={`rounded-lg p-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-brand-600 shadow-xs dark:bg-surface-800 dark:text-brand-400 font-semibold'
                  : 'text-surface-500 hover:text-surface-800 dark:text-surface-400'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {MEETING_TYPES.map((type) => {
          const isSelected = selectedType === type;
          return (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'border border-surface-200 bg-white text-surface-700 hover:border-surface-300 hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100 dark:hover:border-surface-600 dark:hover:bg-surface-700 dark:hover:text-white'
              }`}
            >
              {type}
            </button>
          );
        })}
      </div>
    </div>
  );
}
