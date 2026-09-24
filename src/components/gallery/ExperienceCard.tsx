import React from 'react';
import { Play, Heart, Layers, Sparkles, Volume2 } from 'lucide-react';
import type { Experience } from '../../types';
import { usePlayerStore } from '../../store/playerStore';
import { useCatalogStore } from '../../store/catalogStore';

interface Props {
  experience: Experience;
  onOpenDetails: (experience: Experience) => void;
  featured?: boolean;
}

export const ExperienceCard: React.FC<Props> = ({
  experience,
  onOpenDetails,
  featured = false
}) => {
  const { startExperience } = usePlayerStore();
  const { toggleFavorite, isFavorite } = useCatalogStore();
  const isFav = isFavorite(experience.id);

  const handleCardClick = () => {
    startExperience(experience);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(experience.id);
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenDetails(experience);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative rounded-2xl overflow-hidden glass-card cursor-pointer select-none transition-all duration-500 hover:scale-[1.02] ${
        featured ? 'col-span-1 md:col-span-2' : ''
      }`}
    >
      {/* Cover Image */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-black/40">
        <img
          src={experience.coverUrl}
          alt={experience.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090B] via-[#08090B]/30 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5">
            {experience.badge && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider bg-black/60 backdrop-blur-md border border-white/15 text-white/90 font-medium">
                {experience.badge}
              </span>
            )}
            {experience.soundscape && experience.soundscape !== 'none' && (
              <span className="p-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-sky-300" title="Includes Ambient Soundscape">
                <Volume2 className="w-3 h-3" />
              </span>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className={`p-2 rounded-full glass-dock pointer-events-auto transition-transform active:scale-90 ${
              isFav ? 'text-rose-500' : 'text-white/60 hover:text-white'
            }`}
            title="Favorite Experience"
          >
            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500' : ''}`} />
          </button>
        </div>

        {/* Quick Play Overlay Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-5 h-5 fill-black translate-x-0.5" />
          </div>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-display font-bold text-base sm:text-lg text-white group-hover:text-sky-300 transition-colors line-clamp-1">
              {experience.name}
            </h3>
            <span className="text-[11px] font-mono text-white/40 shrink-0">
              {experience.mediaIds.length} scenes
            </span>
          </div>

          <p className="text-xs text-white/60 font-light line-clamp-2 leading-relaxed mb-3">
            {experience.description}
          </p>
        </div>

        {/* Card Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/6">
          <div className="flex items-center gap-1.5 flex-wrap">
            {experience.moods.slice(0, 2).map((m) => (
              <span
                key={m}
                className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-white/6 text-white/50"
              >
                {m}
              </span>
            ))}
          </div>

          <button
            onClick={handleDetailsClick}
            className="text-xs text-white/50 hover:text-white font-medium flex items-center gap-1 transition-colors pointer-events-auto"
          >
            <span>Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};
