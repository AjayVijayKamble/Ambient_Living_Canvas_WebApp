import React from 'react';
import { X, Sliders, RotateCcw, Clock, Volume2, ShieldCheck, Zap } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import type { TransitionType, MotionLevel, PerformanceMode, SoundscapeType } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const settings = useSettingsStore();

  if (!isOpen) return null;

  const DURATIONS = [5, 10, 15, 30, 60];

  const TRANSITIONS: { id: TransitionType; label: string; desc: string }[] = [
    { id: 'crossfade', label: 'Crossfade', desc: 'Smooth, subtle opacity blend' },
    { id: 'zoom-fade', label: 'Zoom Fade', desc: 'Subtle focal scale expansion' },
    { id: 'cinematic', label: 'Cinematic', desc: 'Anamorphic contrast glide' },
    { id: 'dissolve', label: 'Dissolve', desc: 'Soft tonal transition' },
    { id: 'blur-fade', label: 'Blur Fade', desc: 'Dreamy soft focal blend' },
    { id: 'light-leak', label: 'Light Leak', desc: 'Warm analog film glow' }
  ];

  const MOTION_LEVELS: { id: MotionLevel; label: string }[] = [
    { id: 'off', label: 'Off' },
    { id: 'subtle', label: 'Subtle' },
    { id: 'medium', label: 'Medium' },
    { id: 'dynamic', label: 'Dynamic' }
  ];

  const PERF_MODES: { id: PerformanceMode; label: string; desc: string }[] = [
    { id: 'standard', label: 'Standard', desc: 'Pure crossfade, lowest CPU' },
    { id: 'enhanced', label: 'Enhanced', desc: 'Ken Burns GPU motion' },
    { id: 'ultra', label: 'Ultra', desc: 'Motion + dynamic canvas particles' }
  ];

  const SOUNDSCAPES: { id: SoundscapeType; label: string }[] = [
    { id: 'none', label: 'Off' },
    { id: 'rain', label: '🌧️ Gentle Rain' },
    { id: 'ocean', label: '🌊 Ocean Waves' },
    { id: 'forest', label: '🌲 Forest Wind' },
    { id: 'fireplace', label: '🔥 Fireplace' },
    { id: 'space', label: '🌌 Deep Space' },
    { id: 'cafe', label: '☕ Café' },
    { id: 'meditation', label: '🧘 Tibetan Bowls' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-[#111318] border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/8 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-white tracking-wide">
                Experience Settings
              </h2>
              <p className="text-xs text-white/50 font-light mt-0.5">
                Customize playback speed, motion dynamics, and ambient overlays.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full glass-dock text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Settings Options */}
        <div className="space-y-6 overflow-y-auto pr-1 flex-1 text-xs">
          {/* Slideshow Duration */}
          <div>
            <label className="block font-mono uppercase tracking-wider text-white/60 mb-2">
              Slide Duration (Seconds)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {DURATIONS.map((dur) => (
                <button
                  key={dur}
                  onClick={() => settings.setSlideshowDuration(dur)}
                  className={`py-2 rounded-xl font-mono text-xs font-semibold transition-all cursor-pointer border ${
                    settings.slideshowDuration === dur
                      ? 'bg-white text-black border-white shadow-md'
                      : 'glass-pill text-white/60 hover:text-white'
                  }`}
                >
                  {dur}s
                </button>
              ))}
            </div>
          </div>

          {/* Transition Style */}
          <div>
            <label className="block font-mono uppercase tracking-wider text-white/60 mb-2">
              Transition Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TRANSITIONS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => settings.setTransition(t.id)}
                  className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                    settings.transition === t.id
                      ? 'bg-white/15 border-sky-400 text-white shadow-sm'
                      : 'glass-pill text-white/60 hover:text-white'
                  }`}
                >
                  <span className="font-semibold block">{t.label}</span>
                  <span className="text-[10px] text-white/40 block mt-0.5">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ken Burns Motion Level */}
          <div>
            <label className="block font-mono uppercase tracking-wider text-white/60 mb-2">
              Ken Burns Motion Intensity
            </label>
            <div className="grid grid-cols-4 gap-2">
              {MOTION_LEVELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => settings.setMotionLevel(m.id)}
                  className={`py-2 rounded-xl font-medium text-xs transition-all cursor-pointer border ${
                    settings.motionLevel === m.id
                      ? 'bg-white text-black font-semibold shadow-md'
                      : 'glass-pill text-white/60 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Performance Mode */}
          <div>
            <label className="block font-mono uppercase tracking-wider text-white/60 mb-2">
              Performance & Visual Fidelity
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PERF_MODES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => settings.setPerformanceMode(p.id)}
                  className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                    settings.performanceMode === p.id
                      ? 'bg-white/15 border-emerald-400 text-white shadow-sm'
                      : 'glass-pill text-white/60 hover:text-white'
                  }`}
                >
                  <span className="font-semibold block">{p.label}</span>
                  <span className="text-[10px] text-white/40 block mt-0.5">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toggles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Show Minimalist Clock */}
            <div className="flex items-center justify-between p-3 rounded-2xl glass-card">
              <div>
                <span className="font-semibold text-white block">Minimalist Clock</span>
                <span className="text-[11px] text-white/40 block">Display clock in bottom-right</span>
              </div>
              <input
                type="checkbox"
                checked={settings.showClock}
                onChange={settings.toggleClock}
                className="w-4 h-4 rounded accent-sky-400 cursor-pointer"
              />
            </div>

            {/* Adaptive Time-of-Day */}
            <div className="flex items-center justify-between p-3 rounded-2xl glass-card">
              <div>
                <span className="font-semibold text-white block">Adaptive Time Mode</span>
                <span className="text-[11px] text-white/40 block">Align moods to current local hour</span>
              </div>
              <input
                type="checkbox"
                checked={settings.adaptiveMode}
                onChange={settings.toggleAdaptiveMode}
                className="w-4 h-4 rounded accent-sky-400 cursor-pointer"
              />
            </div>

            {/* Journey Mode */}
            <div className="flex items-center justify-between p-3 rounded-2xl glass-card">
              <div>
                <span className="font-semibold text-white block">Journey Mode</span>
                <span className="text-[11px] text-white/40 block">Auto-rotate entire collections</span>
              </div>
              <input
                type="checkbox"
                checked={settings.journeyMode}
                onChange={settings.toggleJourneyMode}
                className="w-4 h-4 rounded accent-sky-400 cursor-pointer"
              />
            </div>

            {/* Reduce Motion */}
            <div className="flex items-center justify-between p-3 rounded-2xl glass-card">
              <div>
                <span className="font-semibold text-white block">Reduce Motion</span>
                <span className="text-[11px] text-white/40 block">Disable zoom/pan for low power</span>
              </div>
              <input
                type="checkbox"
                checked={settings.reduceMotion}
                onChange={settings.toggleReduceMotion}
                className="w-4 h-4 rounded accent-sky-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-white/8 mt-6 flex items-center justify-between">
          <button
            onClick={settings.resetToDefaults}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-white text-black font-semibold text-xs hover:bg-white/90 cursor-pointer shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
