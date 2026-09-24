import React from 'react';
import { Play, Sparkles, Monitor, Compass, ShieldCheck } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';

interface Props {
  onExploreClick: () => void;
  onOpenMixBuilder: () => void;
}

export const HeroBanner: React.FC<Props> = ({ onExploreClick, onOpenMixBuilder }) => {
  const { startOneClickAmbient, startSurpriseMe } = usePlayerStore();

  return (
    <div className="relative w-full overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#08090B] mb-12 select-none shadow-2xl">
      {/* Background Cinematic Image with Ken Burns Zoom */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2560&q=85"
          alt="Alpine Vista"
          className="w-full h-full object-cover scale-105 animate-[kenBurnsZoomIn_24s_ease-in-out_infinite_alternate] filter brightness-40 saturate-125"
        />
        {/* Radial Dark Vignette & Mesh Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090B] via-[#08090B]/60 to-transparent" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#08090B]/50 to-[#08090B]" />
        <div className="glow-mesh absolute inset-0 pointer-events-none" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 py-24 sm:py-32 lg:py-36 text-center flex flex-col items-center">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-dock text-xs text-white/80 font-medium mb-8 shadow-md border border-white/15 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Multi-Monitor Ready</span>
          <span className="text-white/30">·</span>
          <span>Zero Login</span>
          <span className="text-white/30">·</span>
          <span className="text-sky-300 font-semibold">4K Ultra HD</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-extrabold tracking-tight text-white mb-6 leading-[1.06] drop-shadow-2xl">
          Turn your idle monitor into a{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-pink-400">
            living canvas
          </span>
          .
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl lg:text-2xl text-white/80 max-w-3xl font-light leading-relaxed mb-10 drop-shadow-md">
          A luxury digital art installation for your desk. Breathtaking curated landscape journeys,
          minimalist architecture, deep cosmos, and generative soundscapes designed for endless playback.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto">
          {/* Primary: Start Ambient */}
          <button
            onClick={startOneClickAmbient}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 sm:px-9 sm:py-4.5 rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600 text-white font-semibold text-sm sm:text-base tracking-wide shadow-xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          >
            <Play className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
            <span>Start Ambient</span>
          </button>

          {/* Secondary: Surprise Me */}
          <button
            onClick={startSurpriseMe}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-4 rounded-full glass-dock text-white/90 font-medium text-sm sm:text-base hover:bg-white/15 hover:text-white transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Surprise Me</span>
          </button>

          {/* Tertiary: Explore */}
          <button
            onClick={onExploreClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-full glass-pill text-white/70 font-medium text-sm sm:text-base hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Experiences</span>
          </button>
        </div>
      </div>
    </div>
  );
};
