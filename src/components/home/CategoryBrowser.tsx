import React, { useState } from 'react';
import { CATEGORIES } from '../../data/categories';
import type { CategoryInfo } from '../../types';
import { usePlayerStore } from '../../store/playerStore';
import {
  Feather,
  Sun,
  Coffee,
  Sparkles,
  Compass,
  Zap,
  Film,
  Eye,
  Crown,
  CircleDot,
  HeartHandshake,
  Moon,
  Mountain,
  Waves,
  Trees,
  Building2,
  Landmark,
  Snowflake,
  Sunrise,
  SunMedium,
  Sunset,
  MoonStar,
  CloudRain,
  Orbit,
  Cpu,
  Sparkle,
  Layers,
  Fish,
  Laptop,
  Car,
  Plane,
  Cloud,
  Globe,
  Play,
  Tv
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Tv,
  Feather,
  Sun,
  Coffee,
  Sparkles,
  Compass,
  Zap,
  Film,
  Eye,
  Crown,
  CircleDot,
  HeartHandshake,
  Moon,
  Mountain,
  Waves,
  Trees,
  Building2,
  Landmark,
  Snowflake,
  Sunrise,
  SunMedium,
  Sunset,
  MoonStar,
  CloudRain,
  Orbit,
  Cpu,
  Sparkle,
  Layers,
  Fish,
  Laptop,
  Car,
  Plane,
  Cloud,
  Globe
};

export const CategoryBrowser: React.FC = () => {
  const [activeGroup, setActiveGroup] = useState<string>('all');
  const { startCategory } = usePlayerStore();

  const GROUPS = [
    { id: 'all', label: 'All Categories' },
    { id: 'mood', label: 'Moods' },
    { id: 'location', label: 'Locations' },
    { id: 'time', label: 'Time of Day' },
    { id: 'world', label: 'Worlds & Themes' },
    { id: 'lifestyle', label: 'Lifestyle' },
    { id: 'nature', label: 'Nature' },
    { id: 'mix', label: 'Smart Mixes' }
  ];

  const filteredCategories = activeGroup === 'all'
    ? CATEGORIES
    : CATEGORIES.filter((c) => c.group === activeGroup);

  return (
    <section className="mb-16 select-none">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-wide">
            Explore Visual Worlds
          </h2>
          <p className="text-xs sm:text-sm text-white/50 font-light mt-0.5">
            Browse by environment, atmosphere, or artistic genre.
          </p>
        </div>

        {/* Group Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGroup(g.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeGroup === g.id
                  ? 'bg-white text-black font-semibold shadow-md'
                  : 'glass-pill text-white/60 hover:text-white'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
        {filteredCategories.map((cat) => {
          const Icon = ICON_MAP[cat.iconName] || Sparkles;

          return (
            <div
              key={cat.id}
              onClick={() => startCategory(cat.id)}
              className="group relative rounded-2xl overflow-hidden glass-card cursor-pointer flex flex-col justify-between aspect-[4/3] p-5 transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl"
            >
              {/* Cover Background Image */}
              <div className="absolute inset-0 overflow-hidden bg-black/50">
                <img
                  src={cat.coverUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 filter brightness-45 group-hover:brightness-60"
                  loading="lazy"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.gradient} opacity-60 group-hover:opacity-40 transition-opacity`} />
              </div>

              {/* Top Row: Icon & Start Play Button */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-white shadow-md group-hover:bg-white/20 transition-colors">
                  <Icon className="w-4 h-4" />
                </div>

                <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 shadow-lg">
                  <Play className="w-3.5 h-3.5 fill-white translate-x-0.5" />
                </div>
              </div>

              {/* Bottom Row: Title & Description */}
              <div className="relative z-10">
                <h3 className="font-display font-bold text-lg text-white group-hover:text-sky-300 transition-colors drop-shadow-md">
                  {cat.name}
                </h3>
                <p className="text-xs text-white/70 font-light line-clamp-2 mt-1 leading-relaxed drop-shadow-sm">
                  {cat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
