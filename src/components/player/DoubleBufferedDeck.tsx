import React, { useState, useEffect, useRef } from 'react';
import type { MediaItem, TransitionType, MotionLevel } from '../../types';
import { motionEngine } from '../../engine/motion';

interface Props {
  currentMedia: MediaItem | undefined;
  transition: TransitionType;
  motionLevel: MotionLevel;
  durationSec: number;
  reduceMotion?: boolean;
}

interface BufferSlot {
  media: MediaItem | null;
  motionParams: ReturnType<typeof motionEngine.getMotionParams> | null;
  key: string;
}

export const DoubleBufferedDeck: React.FC<Props> = ({
  currentMedia,
  transition,
  motionLevel,
  durationSec,
  reduceMotion = false
}) => {
  const [activeSlot, setActiveSlot] = useState<'A' | 'B'>('A');
  const [slotA, setSlotA] = useState<BufferSlot>({ media: null, motionParams: null, key: 'initA' });
  const [slotB, setSlotB] = useState<BufferSlot>({ media: null, motionParams: null, key: 'initB' });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!currentMedia) return;

    const actualMotionLevel = reduceMotion ? 'off' : motionLevel;
    const motionType = motionEngine.getRandomMotionType();
    const motionParams = motionEngine.getMotionParams(
      motionType,
      actualMotionLevel,
      durationSec,
      currentMedia.focalPoint
    );

    const nextSlot = activeSlot === 'A' ? 'B' : 'A';
    const newBuffer: BufferSlot = {
      media: currentMedia,
      motionParams,
      key: `${currentMedia.id}-${Date.now()}`
    };

    if (nextSlot === 'A') {
      setSlotA(newBuffer);
    } else {
      setSlotB(newBuffer);
    }

    setIsTransitioning(true);
    setActiveSlot(nextSlot);

    if (transitionTimerRef.current) {
      window.clearTimeout(transitionTimerRef.current);
    }

    transitionTimerRef.current = window.setTimeout(() => {
      setIsTransitioning(false);
    }, 2600);

    return () => {
      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, [currentMedia?.id, durationSec, motionLevel, reduceMotion]);

  // Transition class helpers
  const getTransitionStyle = (isCurrent: boolean) => {
    const baseTransition = 'transition-all duration-[2400ms] ease-in-out';
    
    switch (transition) {
      case 'zoom-fade':
        return `${baseTransition} ${isCurrent ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`;
      case 'blur-fade':
        return `${baseTransition} ${isCurrent ? 'opacity-100 filter-none' : 'opacity-0 blur-lg'}`;
      case 'dissolve':
        return `${baseTransition} ${isCurrent ? 'opacity-100' : 'opacity-0 contrast-125'}`;
      case 'slide':
        return `${baseTransition} ${isCurrent ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`;
      case 'light-leak':
      case 'cinematic':
      case 'crossfade':
      default:
        return `${baseTransition} ${isCurrent ? 'opacity-100' : 'opacity-0'}`;
    }
  };

  const renderSlot = (slot: BufferSlot, isCurrent: boolean) => {
    if (!slot.media) return null;

    const { start, end, origin, duration } = slot.motionParams || {
      start: { scale: 1, x: 0, y: 0 },
      end: { scale: 1, x: 0, y: 0 },
      origin: '50% 50%',
      duration: durationSec
    };

    return (
      <div
        key={slot.key}
        className={`absolute inset-0 w-full h-full overflow-hidden ${getTransitionStyle(isCurrent)}`}
      >
        <div
          className="w-full h-full"
          style={{
            transformOrigin: origin,
            animation: reduceMotion || motionLevel === 'off' 
              ? 'none' 
              : `kenBurnsCustom ${duration}s cubic-bezier(0.25, 1, 0.5, 1) infinite alternate`
          }}
        >
          <img
            src={slot.media.url}
            alt={slot.media.title}
            className="w-full h-full object-cover select-none pointer-events-none"
            loading="eager"
            decoding="async"
            style={{
              transform: `scale(${isCurrent ? end.scale : start.scale}) translate3d(${isCurrent ? end.x : start.x}%, ${isCurrent ? end.y : start.y}%, 0)`,
              transition: `transform ${duration}s cubic-bezier(0.1, 0.9, 0.2, 1)`
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none">
      {renderSlot(slotA, activeSlot === 'A')}
      {renderSlot(slotB, activeSlot === 'B')}

      {/* Cinematic Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-black/25" />
      
      {/* Light Leak transition overlay if selected */}
      {transition === 'light-leak' && isTransitioning && (
        <div className="light-leak-effect animate-pulse-glow" />
      )}
    </div>
  );
};
