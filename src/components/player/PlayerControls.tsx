import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Clock,
  Heart,
  X,
  Sliders,
  Sparkles,
  Layers
} from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useCatalogStore } from '../../store/catalogStore';
import type { SoundscapeType } from '../../types';

interface Props {
  onOpenSettings: () => void;
  onOpenPlaylists: () => void;
}

export const PlayerControls: React.FC<Props> = ({
  onOpenSettings,
  onOpenPlaylists
}) => {
  const {
    isControlsVisible,
    isPlaying,
    currentIndex,
    queue,
    activeExperience,
    isFullscreen,
    currentSoundscape,
    togglePlay,
    nextSlide,
    prevSlide,
    exitPlayer,
    toggleFullscreen,
    setSoundscape
  } = usePlayerStore();

  const {
    slideshowDuration,
    setSlideshowDuration,
    showClock,
    toggleClock,
    isMuted,
    toggleMute,
    soundVolume,
    setSoundVolume
  } = useSettingsStore();

  const { toggleFavorite, isFavorite } = useCatalogStore();

  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const currentMedia = queue[currentIndex];
  const isFav = currentMedia ? isFavorite(currentMedia.id) : false;

  const SOUNDSCAPES: { id: SoundscapeType; label: string; icon: string }[] = [
    { id: 'none', label: 'Off', icon: '🔇' },
    { id: 'rain', label: 'Gentle Rain', icon: '🌧️' },
    { id: 'ocean', label: 'Ocean Waves', icon: '🌊' },
    { id: 'forest', label: 'Forest Wind', icon: '🌲' },
    { id: 'fireplace', label: 'Cozy Hearth', icon: '🔥' },
    { id: 'space', label: 'Deep Space', icon: '🌌' },
    { id: 'cafe', label: 'Warm Café', icon: '☕' },
    { id: 'meditation', label: 'Tibetan Bowls', icon: '🧘' }
  ];

  return (
    <div
      className={`absolute inset-0 pointer-events-none z-30 transition-opacity duration-700 select-none ${
        isControlsVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Top Bar HUD */}
      <div className="absolute top-6 inset-x-8 flex items-center justify-between pointer-events-auto">
        {/* Left: Exit Button */}
        <button
          onClick={exitPlayer}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full glass-dock text-white/80 hover:text-white hover:bg-white/15 transition-all text-xs font-medium cursor-pointer"
          title="Exit Experience (Esc)"
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">Exit</span>
        </button>

        {/* Right: Actions (Sound, Speed, Clock, Settings, Fullscreen) */}
        <div className="flex items-center gap-2 relative">
          {/* Soundscapes Picker */}
          <div className="relative">
            <button
              onClick={() => setShowAudioMenu(!showAudioMenu)}
              className={`p-2.5 rounded-full glass-dock text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer ${
                currentSoundscape !== 'none' && !isMuted ? 'text-sky-400 border-sky-500/40' : ''
              }`}
              title="Ambient Soundscapes (M)"
            >
              {isMuted || currentSoundscape === 'none' ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            {/* Audio Dropdown */}
            {showAudioMenu && (
              <div className="absolute right-0 mt-3 w-56 glass-dock rounded-2xl p-3 flex flex-col gap-2 shadow-2xl z-40">
                <div className="flex items-center justify-between text-xs text-white/60 font-mono pb-2 border-b border-white/10">
                  <span>AMBIENT SOUNDSCAPE</span>
                  <button
                    onClick={toggleMute}
                    className="text-sky-400 hover:underline cursor-pointer"
                  >
                    {isMuted ? 'Unmute' : 'Mute'}
                  </button>
                </div>

                <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                  {SOUNDSCAPES.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSoundscape(item.id);
                        setShowAudioMenu(false);
                      }}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                        currentSoundscape === item.id
                          ? 'bg-white/20 text-white font-semibold'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </span>
                      {currentSoundscape === item.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Volume Slider */}
                <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-xs text-white/70">
                  <span className="text-[10px] font-mono">VOL</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={soundVolume}
                    onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Duration Selector */}
          <div className="flex items-center glass-dock rounded-full px-1 py-0.5 text-xs">
            {[10, 15, 30].map((dur) => (
              <button
                key={dur}
                onClick={() => setSlideshowDuration(dur)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer ${
                  slideshowDuration === dur
                    ? 'bg-white/20 text-white font-medium shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {dur}s
              </button>
            ))}
          </div>

          {/* Clock Toggle */}
          <button
            onClick={toggleClock}
            className={`p-2.5 rounded-full glass-dock text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer ${
              showClock ? 'text-amber-300' : ''
            }`}
            title="Toggle Clock (C)"
          >
            <Clock className="w-4 h-4" />
          </button>

          {/* Settings Modal */}
          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-full glass-dock text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
            title="Experience Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-full glass-dock text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
            title="Toggle Fullscreen (F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Bottom Floating Control Dock */}
      <div className="absolute bottom-8 inset-x-0 flex justify-center pointer-events-auto px-4">
        <div className="glass-dock rounded-full px-5 py-2.5 flex items-center gap-4 sm:gap-6 shadow-2xl">
          {/* Previous Slide */}
          <button
            onClick={prevSlide}
            className="p-1.5 rounded-full hover:bg-white/15 text-white/70 hover:text-white transition-all cursor-pointer"
            title="Previous (Left Arrow)"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play / Pause Toggle */}
          <button
            onClick={togglePlay}
            className="p-2.5 rounded-full bg-white text-black hover:scale-105 transition-all cursor-pointer shadow-lg"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black translate-x-0.5" />}
          </button>

          {/* Next Slide */}
          <button
            onClick={nextSlide}
            className="p-1.5 rounded-full hover:bg-white/15 text-white/70 hover:text-white transition-all cursor-pointer"
            title="Next (Right Arrow)"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Slide Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 text-xs font-mono text-white/60">
            <span>{currentIndex + 1}</span>
            <span>/</span>
            <span>{queue.length}</span>
          </div>

          <div className="w-[1px] h-4 bg-white/15 hidden sm:block" />

          {/* Favorite Toggle */}
          {currentMedia && (
            <button
              onClick={() => toggleFavorite(currentMedia.id)}
              className={`p-1.5 rounded-full hover:bg-white/15 transition-all cursor-pointer ${
                isFav ? 'text-rose-500' : 'text-white/60 hover:text-white'
              }`}
              title={isFav ? 'Remove from Favorites' : 'Add to Favorites'}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
            </button>
          )}

          {/* Add to Playlist */}
          <button
            onClick={onOpenPlaylists}
            className="p-1.5 rounded-full hover:bg-white/15 text-white/60 hover:text-white transition-all cursor-pointer"
            title="Add to Playlist"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
