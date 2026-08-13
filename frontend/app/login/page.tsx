'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  LogIn,
  ShieldCheck,
  User,
  Mail,
  Building,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore, UserProfile } from '@/lib/store';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAppStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [workspace, setWorkspace] = useState('Scaler AI Labs');

  const handleDemoLogin = () => {
    const demoUser: UserProfile = {
      name: 'Bhawya Gulati',
      email: 'bhawya@scaler.com',
      role: 'SDE Fullstack Candidate',
      workspace: 'Scaler AI Labs',
      avatarInitials: 'BG',
    };
    login(demoUser);
    toast.success(`Welcome back, ${demoUser.name}!`);
    router.push('/');
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const customUser: UserProfile = {
      name: name.trim(),
      email: email.trim(),
      role: 'Team Member',
      workspace: workspace.trim() || 'Scaler AI Labs',
      avatarInitials: initials || 'US',
    };

    login(customUser);
    toast.success(`Logged in as ${customUser.name}!`);
    router.push('/');
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-surface-200 bg-white p-8 shadow-2xl dark:border-surface-800 dark:bg-surface-900 animate-slide-up">
        {/* Brand Icon & Heading */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-500 text-white shadow-lg shadow-brand-600/30">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="mt-4 font-heading text-2xl font-bold text-surface-900 dark:text-white">
            Welcome to Fireflies<span className="text-brand-600 dark:text-brand-400">.ai</span>
          </h2>
          <p className="mt-1 text-xs text-surface-500">
            Sign in to access your transcribed meetings, AI summaries, and action items.
          </p>
        </div>

        {/* 1-Click Fast Evaluation Login CTA */}
        <div className="mt-6">
          <button
            onClick={handleDemoLogin}
            className="flex w-full items-center justify-between rounded-2xl border border-brand-300 bg-gradient-to-r from-brand-50 to-indigo-50/50 p-4 text-left shadow-xs transition-all hover:border-brand-500 hover:shadow-md dark:border-brand-800 dark:from-brand-950/60 dark:to-indigo-950/40 active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 font-heading text-sm font-bold text-white shadow-xs">
                BG
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-surface-900 dark:text-white">
                    Bhawya Gulati
                  </span>
                  <span className="rounded-md bg-brand-200/60 px-1.5 py-0.2 text-[9px] font-bold text-brand-800 dark:bg-brand-900 dark:text-brand-200">
                    Candidate Demo
                  </span>
                </div>
                <p className="text-[11px] text-surface-500">bhawya@scaler.com · Scaler AI Labs</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          </button>
        </div>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-surface-200 dark:bg-surface-800"></div>
          <span className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">
            or sign in with custom details
          </span>
          <div className="h-px flex-1 bg-surface-200 dark:bg-surface-800"></div>
        </div>

        {/* Custom Login Form */}
        <form onSubmit={handleCustomLogin} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
              Your Full Name
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3 h-4 w-4 text-surface-400" />
              <input
                type="text"
                required
                placeholder="e.g. Sarah Connor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 w-full rounded-xl border border-surface-200 bg-white pl-9 pr-3 text-xs text-surface-900 focus:border-brand-500 focus:outline-hidden dark:border-surface-700 dark:bg-surface-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 h-4 w-4 text-surface-400" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 w-full rounded-xl border border-surface-200 bg-white pl-9 pr-3 text-xs text-surface-900 focus:border-brand-500 focus:outline-hidden dark:border-surface-700 dark:bg-surface-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
              Workspace Team Name
            </label>
            <div className="relative flex items-center">
              <Building className="absolute left-3 h-4 w-4 text-surface-400" />
              <input
                type="text"
                placeholder="Scaler AI Labs Workspace"
                value={workspace}
                onChange={(e) => setWorkspace(e.target.value)}
                className="h-10 w-full rounded-xl border border-surface-200 bg-white pl-9 pr-3 text-xs text-surface-900 focus:border-brand-500 focus:outline-hidden dark:border-surface-700 dark:bg-surface-800 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-600/20 transition-all hover:bg-brand-700 active:scale-98"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In to Workspace</span>
          </button>
        </form>

        <div className="mt-6 text-center text-[11px] text-surface-400">
          🔒 Secure Post-Meeting Workspace · Scaler AI Labs Assignment
        </div>
      </div>
    </div>
  );
}
