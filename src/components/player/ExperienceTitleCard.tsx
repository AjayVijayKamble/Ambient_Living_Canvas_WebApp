import React, { useState, useEffect } from 'react';
import type { MediaItem, Experience } from '../../types';
import { MapPin, Camera } from 'lucide-react';

interface Props {
  experience: Experience | null;
  currentMedia: MediaItem | undefined;
  showAlways?: boolean;
}

export const ExperienceTitleCard: React.FC<Props> = ({
  experience,
  currentMedia,
  showAlways = false
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    if (showAlways) return;

    const timer = setTimeout(() => {
      setVisible(false);
    }, 3600);

    return () => clearTimeout(timer);
  }, [currentMedia?.id, experience?.id, showAlways]);

  if (!experience && !currentMedia) return null;

  return (
    <div
      className={`absolute top-10 left-10 z-20 pointer-events-none transition-all duration-1000 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
      }`}
    >
      <div className="flex flex-col gap-1.5 max-w-lg select-none">
        {experience && (
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-white/10 backdrop-blur-md border border-white/15 text-white/90">
              {experience.badge || 'Ambient'}
            </span>
            <span className="text-xs tracking-wider text-white/60 font-medium">
              {experience.name}
            </span>
          </div>
        )}

        <h2 className="text-xl md:text-2xl font-display font-medium text-white tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
          {currentMedia?.title || experience?.name}
        </h2>

        <div className="flex items-center gap-4 text-xs text-white/70 tracking-wide font-light drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]">
          {currentMedia?.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-white/60" />
              {currentMedia.location}
            </span>
          )}
          {currentMedia?.author && (
            <span className="flex items-center gap-1 text-white/50">
              <Camera className="w-3 h-3 text-white/40" />
              {currentMedia.author}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
