import React from 'react';
import type { Experience } from '../../types';
import { ExperienceCard } from '../gallery/ExperienceCard';
import { Sparkles, Layers } from 'lucide-react';

interface Props {
  experiences: Experience[];
  onOpenDetails: (experience: Experience) => void;
  onOpenMixBuilder: () => void;
}

export const FeaturedExperiences: React.FC<Props> = ({
  experiences,
  onOpenDetails,
  onOpenMixBuilder
}) => {
  const featuredList = experiences.filter((e) => e.isFeatured);

  return (
    <section className="mb-14 select-none">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono tracking-widest uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Collections</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-wide">
            Featured Ambient Journeys
          </h2>
          <p className="text-xs sm:text-sm text-white/50 font-light mt-0.5">
            Art installations calibrated for continuous playback on secondary monitors.
          </p>
        </div>

        <button
          onClick={onOpenMixBuilder}
          className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-xs font-medium text-white/80 hover:text-white hover:border-white/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Build Custom Mix</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredList.map((exp, idx) => (
          <ExperienceCard
            key={exp.id}
            experience={exp}
            onOpenDetails={onOpenDetails}
            featured={idx === 0}
          />
        ))}
      </div>
    </section>
  );
};
