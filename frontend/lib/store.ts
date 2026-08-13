import { create } from 'zustand';

interface PlayerState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  playbackRate: number;
  activeSegmentId: string | null;
  seekTarget: number | null;
  volume: number;
  isMuted: boolean;
  activeAudioUrl: string | null;

  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  setActiveSegmentId: (id: string | null) => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setActiveAudioUrl: (url: string | null) => void;
  resetPlayer: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  playbackRate: 1.0,
  activeSegmentId: null,
  seekTarget: null,
  volume: 1.0,
  isMuted: false,
  activeAudioUrl: null,

  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPlaybackRate: (playbackRate) => set({ playbackRate }),
  setActiveSegmentId: (activeSegmentId) => set({ activeSegmentId }),
  seekTo: (seekTarget) => set({ seekTarget, currentTime: seekTarget, isPlaying: true }),
  setVolume: (volume) => set({ volume }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setActiveAudioUrl: (activeAudioUrl) => set({ activeAudioUrl }),
  resetPlayer: () => set({
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    activeSegmentId: null,
    seekTarget: null,
  }),
}));

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  workspace: string;
  avatarInitials: string;
}

const DEFAULT_USER: UserProfile = {
  name: 'Bhawya Gulati',
  email: 'bhawya@scaler.com',
  role: 'SDE Fullstack Candidate',
  workspace: 'Scaler AI Labs',
  avatarInitials: 'BG',
};

interface AppState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  comingSoonFeature: string | null;
  setComingSoonFeature: (feature: string | null) => void;
  user: UserProfile | null;
  login: (user: UserProfile) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'light', // default to light mode
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  isCommandPaletteOpen: false,
  setCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),
  viewMode: 'grid',
  setViewMode: (viewMode) => set({ viewMode }),
  comingSoonFeature: null,
  setComingSoonFeature: (comingSoonFeature) => set({ comingSoonFeature }),
  user: null, // default to logged out so they land on /login
  login: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fireflies_user', JSON.stringify(user));
    }
    set({ user });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fireflies_user');
    }
    set({ user: null });
  },
}));
