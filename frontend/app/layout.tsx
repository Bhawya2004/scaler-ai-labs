'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { ComingSoonModal } from '@/components/modals/ComingSoonModal';
import { CreateMeetingModal } from '@/components/modals/CreateMeetingModal';
import { useAppStore } from '@/lib/store';
import { Toaster, toast } from 'sonner';
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, login, user } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    let activeUser = null;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fireflies_user');
      if (stored) {
        try {
          activeUser = JSON.parse(stored);
          login(activeUser);
        } catch {
          // invalid stored json
        }
      }
    }

    // Redirect to login if not authenticated and not on login page
    if (!activeUser && pathname !== '/login') {
      router.push('/login');
    }
  }, [login, pathname, router]);

  const isLoginPage = pathname === '/login';

  return (
    <html lang="en" className={mounted && theme === 'dark' ? 'dark' : ''}>
      <head>
        <title>Fireflies.ai — Meeting Notes & Transcription Platform</title>
        <meta
          name="description"
          content="AI-powered meeting assistant and transcription platform built for Scaler AI Labs."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="min-h-screen bg-surface-50 text-surface-900 antialiased dark:bg-surface-950 dark:text-surface-50">
        <Toaster position="top-right" richColors />
        <CommandPalette />
        <ComingSoonModal />
        <Analytics />

        {/* Global Create Meeting Modal */}
        <CreateMeetingModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={(newMeeting) => {
            toast.success(`Meeting "${newMeeting.title}" created successfully!`);
            window.location.reload();
          }}
        />

        {isLoginPage ? (
          <main className="flex-1 min-h-screen flex items-center justify-center p-4">
            {children}
          </main>
        ) : (
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Layout Container */}
            <div className="flex flex-1 flex-col pl-64 min-w-0">
              <Navbar onOpenCreateModal={() => setCreateModalOpen(true)} />
              <main className="flex-1 p-6 md:p-8">{children}</main>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
