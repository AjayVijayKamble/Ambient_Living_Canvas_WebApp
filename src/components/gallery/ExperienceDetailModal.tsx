import React from 'react';
import { X, Play, Heart, Layers, Volume2, Sparkles, MapPin, Camera } from 'lucide-react';
import type { Experience, MediaItem } from '../../types';
import { usePlayerStore } from '../../store/playerStore';
import { useCatalogStore } from '../../store/catalogStore';

interface Props {
  experience: Experience | null;
  onClose: () => void;
  onOpenPlaylists: (mediaId: string) => void;
}

export const ExperienceDetailModal: React.FC<Props> = ({
  experience,
  onClose,
  onOpenPlaylists
}) => {
  const { startExperience, startCustomQueue } = usePlayerStore();
  const { catalog, toggleFavorite, isFavorite } = useCatalogStore();

  if (!experience) return null;

  const isFav = isFavorite(experience.id);

  const sceneItems = experience.mediaIds
    .map((id) => catalog.find((m) => m.id === id))
    .filter((m): m is MediaItem => Boolean(m));

  const handleStartAll = () => {
    startExperience(experience);
    onClose();
  };

  const handleStartFromScene = (startIndex: number) => {
    const reordered = [
      ...sceneItems.slice(startIndex),
      ...sceneItems.slice(0, startIndex)
    ];
    startCustomQueue(reordered, `${experience.name} (Scene ${startIndex + 1})`, experience.soundscape);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-fade-in select-none">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#111318] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header Cover Banner */}
        <div className="relative w-full h-64 sm:h-72 overflow-hidden bg-black shrink-0">
          <img
            src={experience.coverUrl}
            alt={experience.name}
            className="w-full h-full object-cover filter brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111318] via-[#111318]/40 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full glass-dock text-white/70 hover:text-white hover:bg-white/20 transition-all cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Banner Content */}
          <div className="absolute bottom-6 inset-x-6 sm:inset-x-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {experience.badge && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/15 backdrop-blur-md border border-white/15 text-white">
                    {experience.badge}
                  </span>
                )}
                {experience.soundscape && experience.soundscape !== 'none' && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    <Volume2 className="w-3 h-3" />
                    <span>{experience.soundscape} audio</span>
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-4xl font-display font-bold text-white tracking-wide">
                {experience.name}
              </h2>
              <p className="text-xs sm:text-sm text-white/70 font-light mt-1 line-clamp-2">
                {experience.description}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleFavorite(experience.id)}
                className={`p-3 rounded-full glass-dock transition-all cursor-pointer ${
                  isFav ? 'text-rose-500' : 'text-white/70 hover:text-white'
                }`}
                title="Favorite Experience"
              >
                <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500' : ''}`} />
              </button>

              <button
                onClick={handleStartAll}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600 text-white font-semibold text-xs tracking-wide shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Experience</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body: Scenes Grid */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-base text-white tracking-wide">
              Included Scenes ({sceneItems.length})
            </h3>
            <span className="text-xs text-white/40 font-mono">
              Click any scene to launch
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {sceneItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => handleStartFromScene(idx)}
                className="group relative rounded-xl overflow-hidden glass-card aspect-[16/10] bg-black/40 cursor-pointer transition-all duration-300 hover:scale-[1.03]"
              >
                <img
                  src={item.thumbnailUrl || item.url}
                  alt={item.title}
                  className="w-full h-full object-cover filter brightness-75 group-hover:brightness-100 transition-all"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/60 text-white/80 border border-white/10">
                  #{idx + 1}
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg scale-75 group-hover:scale-100 transition-transform">
                    <Play className="w-3.5 h-3.5 fill-black translate-x-0.5" />
                  </div>
                </div>

                <div className="absolute bottom-2 inset-x-2">
                  <span className="text-[11px] font-medium text-white line-clamp-1 block">
                    {item.title}
                  </span>
                  {item.location && (
                    <span className="text-[9px] text-white/60 font-light line-clamp-1 flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5" />
                      {item.location}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
