'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  FastForward,
  Headphones,
} from 'lucide-react';
import { usePlayerStore } from '@/lib/store';
import { formatTime } from '@/lib/utils';

interface MediaPlayerProps {
  audioUrl?: string;
  totalDuration: number;
}

export function MediaPlayer({ audioUrl, totalDuration }: MediaPlayerProps) {
  const {
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    isPlaying,
    setIsPlaying,
    playbackRate,
    setPlaybackRate,
    seekTarget,
    volume,
    setVolume,
    isMuted,
    toggleMute,
  } = usePlayerStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);

  // Set total duration on mount
  useEffect(() => {
    if (totalDuration > 0 && duration === 0) {
      setDuration(totalDuration);
    }
  }, [totalDuration, duration, setDuration]);

  // Synchronize seek target when user clicks a transcript segment or chapter
  useEffect(() => {
    if (seekTarget !== null && audioRef.current) {
      audioRef.current.currentTime = seekTarget;
      if (!isPlaying) {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  }, [seekTarget, isPlaying, setIsPlaying]);

  // Synchronize volume and mute states to the native audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
      audioRef.current.volume = volume;
    }
  }, [isMuted, volume]);

  // Handle play / pause toggle
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Skip 5 seconds backward/forward
  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(duration || totalDuration, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Update speed
  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    setSpeedMenuOpen(false);
  };

  // Time update event from audio element
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Loaded metadata
  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration) {
      setDuration(audioRef.current.duration);
    }
  };

  // Slider change
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    setCurrentTime(target);
    if (audioRef.current) {
      audioRef.current.currentTime = target;
    }
  };

  const progressPercent = (duration > 0 ? (currentTime / duration) : 0) * 100;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-surface-200 bg-white p-4 shadow-xs dark:border-surface-800 dark:bg-surface-900">
      {/* Hidden native audio element */}
      <audio
        ref={audioRef}
        src={audioUrl || "https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3"}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Seek Progress Bar */}
      <div className="relative flex items-center">
        <input
          type="range"
          min={0}
          max={duration || totalDuration || 100}
          step={0.1}
          value={currentTime}
          onChange={handleSeekChange}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-surface-200 accent-brand-600 dark:bg-surface-800"
          style={{
            background: `linear-gradient(to right, #5B45E0 ${progressPercent}%, #e2e8f0 ${progressPercent}%)`,
          }}
        />
      </div>

      {/* Control Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Playback controls */}
        <div className="flex items-center gap-2">
          {/* Skip Back 5s */}
          <button
            onClick={() => skip(-5)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800"
            title="Rewind 5 seconds"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Primary Play / Pause Button */}
          <button
            onClick={togglePlay}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-600/30 transition-transform hover:scale-105 hover:bg-brand-700 active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Skip Forward 5s */}
          <button
            onClick={() => skip(5)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800"
            title="Forward 5 seconds"
          >
            <RotateCw className="h-4 w-4" />
          </button>

          {/* Timecode */}
          <div className="ml-2 flex items-center gap-1 font-mono text-xs font-semibold text-surface-700 dark:text-surface-300">
            <span>{formatTime(currentTime)}</span>
            <span className="text-surface-400">/</span>
            <span className="text-surface-400">{formatTime(duration || totalDuration)}</span>
          </div>

          {/* Live Soundwave indicator when playing */}
          {isPlaying && (
            <div className="ml-3 hidden items-center gap-0.5 sm:flex">
              <span className="w-1 rounded-full bg-brand-500 animate-wave-1"></span>
              <span className="w-1 rounded-full bg-brand-600 animate-wave-2"></span>
              <span className="w-1 rounded-full bg-indigo-500 animate-wave-3"></span>
              <span className="w-1 rounded-full bg-violet-600 animate-wave-4"></span>
            </div>
          )}
        </div>

        {/* Right: Playback Speed & Volume */}
        <div className="flex items-center gap-3">
          {/* Speed Selector */}
          <div className="relative">
            <button
              onClick={() => setSpeedMenuOpen(!speedMenuOpen)}
              className="flex items-center gap-1 rounded-lg border border-surface-200 bg-surface-50 px-2.5 py-1 text-xs font-semibold text-surface-700 hover:bg-surface-100 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300"
            >
              <span>{playbackRate}x</span>
            </button>

            {speedMenuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setSpeedMenuOpen(false)}></div>
                <div className="absolute right-0 bottom-9 z-30 flex flex-col rounded-xl border border-surface-200 bg-white p-1 shadow-xl dark:border-surface-800 dark:bg-surface-800 animate-slide-up">
                  {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handleSpeedChange(rate)}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold text-left transition-colors ${
                        playbackRate === rate
                          ? 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300'
                          : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-700'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Volume / Mute */}
          <button
            onClick={toggleMute}
            className="rounded-lg p-1.5 text-surface-500 hover:bg-surface-100 hover:text-surface-800 dark:hover:bg-surface-800 dark:text-surface-400"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-rose-500" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
