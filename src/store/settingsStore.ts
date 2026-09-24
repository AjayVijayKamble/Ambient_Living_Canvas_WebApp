import { create } from 'zustand';
import type { UserSettings, TransitionType, MotionLevel, PerformanceMode, SoundscapeType } from '../types';

interface SettingsState extends UserSettings {
  updateSettings: (partial: Partial<UserSettings>) => void;
  setSlideshowDuration: (duration: number) => void;
  setTransition: (transition: TransitionType) => void;
  setMotionLevel: (level: MotionLevel) => void;
  setPerformanceMode: (mode: PerformanceMode) => void;
  setSoundscape: (soundscape: SoundscapeType) => void;
  setSoundVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleClock: () => void;
  toggleAdaptiveMode: () => void;
  toggleJourneyMode: () => void;
  toggleReduceMotion: () => void;
  resetToDefaults: () => void;
}

const STORAGE_KEY = 'ambient_user_settings_v1';

const DEFAULT_SETTINGS: UserSettings = {
  slideshowDuration: 15,
  transition: 'crossfade',
  motionLevel: 'medium',
  performanceMode: 'ultra',
  soundscape: 'none',
  soundVolume: 0.35,
  isMuted: false,
  showClock: true,
  clockFormat: '12h',
  showTitleCard: true,
  adaptiveMode: false,
  journeyMode: false,
  journeyIntervalMinutes: 20,
  reduceMotion: false,
  autoFullscreenOnStart: true,
  smartRandomization: true
};

const loadInitialSettings = (): UserSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn('[Ambient] Failed to read settings from localStorage:', err);
  }
  return DEFAULT_SETTINGS;
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...loadInitialSettings(),

  updateSettings: (partial) => {
    set((state) => {
      const next = { ...state, ...partial };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.warn('[Ambient] Failed to persist settings:', err);
      }
      return partial;
    });
  },

  setSlideshowDuration: (slideshowDuration) => get().updateSettings({ slideshowDuration }),
  setTransition: (transition) => get().updateSettings({ transition }),
  setMotionLevel: (motionLevel) => get().updateSettings({ motionLevel }),
  setPerformanceMode: (performanceMode) => get().updateSettings({ performanceMode }),
  setSoundscape: (soundscape) => get().updateSettings({ soundscape }),
  setSoundVolume: (soundVolume) => get().updateSettings({ soundVolume }),
  toggleMute: () => get().updateSettings({ isMuted: !get().isMuted }),
  toggleClock: () => get().updateSettings({ showClock: !get().showClock }),
  toggleAdaptiveMode: () => get().updateSettings({ adaptiveMode: !get().adaptiveMode }),
  toggleJourneyMode: () => get().updateSettings({ journeyMode: !get().journeyMode }),
  toggleReduceMotion: () => get().updateSettings({ reduceMotion: !get().reduceMotion }),

  resetToDefaults: () => {
    set(DEFAULT_SETTINGS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    } catch {
      // ignore
    }
  }
}));
