import React, { useEffect, useCallback } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useCatalogStore } from '../../store/catalogStore';
import { DoubleBufferedDeck } from './DoubleBufferedDeck';
import { AtmosphericOverlay } from './AtmosphericOverlay';
import { MinimalistClock } from './MinimalistClock';
import { ExperienceTitleCard } from './ExperienceTitleCard';
import { PlayerControls } from './PlayerControls';

interface Props {
  onOpenSettings: () => void;
  onOpenPlaylists: () => void;
}

export const FullscreenPlayer: React.FC<Props> = ({
  onOpenSettings,
  onOpenPlaylists
}) => {
  const {
    isPlayerOpen,
    activeExperience,
    queue,
    currentIndex,
    isPlaying,
    isControlsVisible,
    pingActivity,
    nextSlide,
    prevSlide,
    togglePlay,
    exitPlayer,
    toggleFullscreen,
    setFullscreenState,
    startExperience
  } = usePlayerStore();

  const {
    slideshowDuration,
    transition,
    motionLevel,
    performanceMode,
    showClock,
    clockFormat,
    showTitleCard,
    journeyMode,
    journeyIntervalMinutes,
    reduceMotion,
    toggleMute,
    toggleClock
  } = useSettingsStore();

  const { experiences } = useCatalogStore();

  const currentMedia = queue[currentIndex];

  // Slideshow auto-advance timer
  useEffect(() => {
    if (!isPlayerOpen || !isPlaying || queue.length === 0) return;

    const timer = setInterval(() => {
      nextSlide();
    }, slideshowDuration * 1000);

    return () => clearInterval(timer);
  }, [isPlayerOpen, isPlaying, slideshowDuration, queue.length, nextSlide]);

  // Journey Mode: Auto-rotate experiences over time
  useEffect(() => {
    if (!isPlayerOpen || !journeyMode || experiences.length === 0) return;

    const intervalMs = (journeyIntervalMinutes || 20) * 60 * 1000;
    const timer = setInterval(() => {
      const remaining = experiences.filter(e => e.id !== activeExperience?.id);
      if (remaining.length > 0) {
        const nextExp = remaining[Math.floor(Math.random() * remaining.length)];
        startExperience(nextExp, false);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlayerOpen, journeyMode, journeyIntervalMinutes, experiences, activeExperience?.id, startExperience]);

  // Sync fullscreen change events from browser
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreenState(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [setFullscreenState]);

  // Keyboard shortcut handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isPlayerOpen) return;

      // Ignore when typing inside an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      pingActivity();

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevSlide();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyC':
          e.preventDefault();
          toggleClock();
          break;
        case 'Escape':
          e.preventDefault();
          exitPlayer();
          break;
      }
    },
    [
      isPlayerOpen,
      pingActivity,
      togglePlay,
      nextSlide,
      prevSlide,
      toggleFullscreen,
      toggleMute,
      toggleClock,
      exitPlayer
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Mouse activity listener
  const handleMouseMove = () => {
    pingActivity();
  };

  if (!isPlayerOpen) return null;

  // Determine active particle effect
  const activeParticle = currentMedia?.particleEffect || activeExperience?.particleEffect || 'none';

  return (
    <div
      onMouseMove={handleMouseMove}
      onClick={handleMouseMove}
      onTouchStart={handleMouseMove}
      className={`fixed inset-0 w-screen h-screen z-50 bg-black overflow-hidden select-none ${
        !isControlsVisible ? 'cursor-none' : 'cursor-default'
      }`}
    >
      {/* 1. Double-Buffered Visual Deck */}
      <DoubleBufferedDeck
        currentMedia={currentMedia}
        transition={transition}
        motionLevel={motionLevel}
        durationSec={slideshowDuration}
        reduceMotion={reduceMotion}
      />

      {/* 2. Atmospheric Canvas Particles Layer */}
      <AtmosphericOverlay
        type={activeParticle}
        performanceMode={performanceMode}
        reduceMotion={reduceMotion}
      />

      {/* 3. Subtle Title Card (fades after 3.2s) */}
      {showTitleCard && (
        <ExperienceTitleCard
          experience={activeExperience}
          currentMedia={currentMedia}
        />
      )}

      {/* 4. Minimalist Ambient Clock Overlay */}
      {showClock && <MinimalistClock format={clockFormat} />}

      {/* 5. Auto-Hiding Player Controls HUD */}
      <PlayerControls
        onOpenSettings={onOpenSettings}
        onOpenPlaylists={onOpenPlaylists}
      />
    </div>
  );
};
