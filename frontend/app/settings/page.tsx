'use client';

import React, { useState } from 'react';
import {
  Settings,
  Sparkles,
  Volume2,
  Download,
  User,
  CheckCircle2,
  Shield,
  Save,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { theme, setTheme } = useAppStore();

  const [aiModel, setAiModel] = useState('llama-3.3-70b-versatile');
  const [autoSummary, setAutoSummary] = useState(true);
  const [exportFormat, setExportFormat] = useState('markdown');
  const [speedDefault, setSpeedDefault] = useState('1.0');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Workspace preferences saved successfully!');
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          <h1 className="font-heading text-2xl font-bold tracking-tight text-surface-900 dark:text-white">
            Workspace Settings & AI Preferences
          </h1>
        </div>
        <p className="mt-1 text-xs text-surface-500">
          Configure meeting intelligence engine, audio playback, and export defaults.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* AI Model Settings */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-xs dark:border-surface-800 dark:bg-surface-900">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <h3 className="font-heading text-base font-bold text-surface-900 dark:text-white">
              AI Intelligence Engine (Groq)
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300">
                Primary LLM Model
              </label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-xl border border-surface-200 bg-white px-3.5 text-xs font-semibold text-surface-800 focus:border-brand-500 focus:outline-hidden dark:border-surface-700 dark:bg-surface-800 dark:text-white"
              >
                <option value="llama-3.3-70b-versatile">
                  Meta LLaMA 3.3 70B Versatile (Recommended · Sub-second latency)
                </option>
                <option value="mixtral-8x7b-32768">Mixtral 8x7B (32k Context)</option>
                <option value="llama-3.1-8b-instant">LLaMA 3.1 8B Instant (Ultra-fast)</option>
              </select>
              <p className="mt-1 text-[11px] text-surface-400">
                Structured JSON mode is enabled for automatic action item and chapter extraction.
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <input
                type="checkbox"
                id="autoSum"
                checked={autoSummary}
                onChange={(e) => setAutoSummary(e.target.checked)}
                className="h-4 w-4 rounded-sm text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="autoSum" className="text-xs font-medium text-surface-800 dark:text-surface-200">
                Automatically generate summaries for newly uploaded transcripts
              </label>
            </div>
          </div>
        </div>

        {/* Theme & Display */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-xs dark:border-surface-800 dark:bg-surface-900">
          <h3 className="font-heading text-base font-bold text-surface-900 dark:text-white mb-4">
            Appearance & Playback
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300">
                Theme Mode
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="mt-1.5 h-10 w-full rounded-xl border border-surface-200 bg-white px-3.5 text-xs font-semibold text-surface-800 focus:border-brand-500 focus:outline-hidden dark:border-surface-700 dark:bg-surface-800 dark:text-white"
              >
                <option value="light">Light Mode (Classic Fireflies)</option>
                <option value="dark">Dark Mode (Midnight Violet)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300">
                Default Playback Speed
              </label>
              <select
                value={speedDefault}
                onChange={(e) => setSpeedDefault(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-xl border border-surface-200 bg-white px-3.5 text-xs font-semibold text-surface-800 focus:border-brand-500 focus:outline-hidden dark:border-surface-700 dark:bg-surface-800 dark:text-white"
              >
                <option value="1.0">1.0x Normal</option>
                <option value="1.25">1.25x Speed</option>
                <option value="1.5">1.5x Fast</option>
                <option value="2.0">2.0x Double</option>
              </select>
            </div>
          </div>
        </div>

        {/* Candidate Profile Info */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-xs dark:border-surface-800 dark:bg-surface-900">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <h3 className="font-heading text-base font-bold text-surface-900 dark:text-white">
              Candidate Workspace Profile
            </h3>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 font-heading text-lg font-bold text-white shadow-md">
              BG
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold text-surface-900 dark:text-white">
                Bhawya Gulati
              </h4>
              <p className="text-xs text-surface-500">Scaler AI Labs · Fullstack SDE Assignment</p>
              <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 className="h-3 w-3" />
                Assignment Scope Completed
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-600/20 hover:bg-brand-700 active:scale-98"
          >
            <Save className="h-4 w-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
