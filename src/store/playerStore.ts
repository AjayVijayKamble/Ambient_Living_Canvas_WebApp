import { create } from 'zustand';
import type { MediaItem, Experience, SoundscapeType } from '../types';
import { useCatalogStore } from './catalogStore';
import { useSettingsStore } from './settingsStore';
import { randomizer } from '../engine/randomizer';
import { soundscapes } from '../engine/soundscapes';
import { preloader } from '../engine/preloader';

interface PlayerState {
  isPlayerOpen: boolean;
  activeExperience: Experience | null;
  queue: MediaItem[];
  currentIndex: number;
  isPlaying: boolean;
  isControlsVisible: boolean;
  isFullscreen: boolean;
  controlsTimeoutId: number | null;
  slideStartTime: number;
  currentSoundscape: SoundscapeType;

  // Actions
  startExperience: (experience: Experience, requestFullscreen?: boolean, directItems?: MediaItem[]) => void;
  startMood: (mood: string) => void;
  startCategory: (categoryId: string) => void;
  startCustomQueue: (items: MediaItem[], title?: string, soundscape?: SoundscapeType) => void;
  startOneClickAmbient: () => void;
  startSurpriseMe: () => void;
  nextSlide: () => void;
  prevSlide: () => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  showControls: () => void;
  hideControls: () => void;
  pingActivity: () => void;
  exitPlayer: () => void;
  toggleFullscreen: () => void;
  setFullscreenState: (isFullscreen: boolean) => void;
  setSoundscape: (soundscape: SoundscapeType) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  isPlayerOpen: false,
  activeExperience: null,
  queue: [],
  currentIndex: 0,
  isPlaying: true,
  isControlsVisible: true,
  isFullscreen: false,
  controlsTimeoutId: null,
  slideStartTime: Date.now(),
  currentSoundscape: 'none',

  startExperience: (experience, requestFullscreen = true, directItems?: MediaItem[]) => {
    const catalog = useCatalogStore.getState().catalog;
    const settings = useSettingsStore.getState();

    // Resolve media items: prioritize direct items (e.g. from user custom albums)
    let items: MediaItem[] = [];
    if (directItems && directItems.length > 0) {
      items = directItems;
    } else {
      items = experience.mediaIds
        .map((id) => catalog.find((m) => m.id === id))
        .filter((m): m is MediaItem => Boolean(m));

      if (items.length === 0) {
        items = catalog.slice(0, 10);
      }
    }

    // Apply smart randomization if enabled
    if (settings.smartRandomization) {
      items = randomizer.getSmartPlaylist(items);
    }

    // Preload next upcoming items
    preloader.preloadQueue(items.map((i) => i.url));

    const sound = experience.soundscape || settings.soundscape || 'none';

    // Start soundscape if selected and not muted
    if (sound !== 'none' && !settings.isMuted) {
      soundscapes.play(sound);
    } else {
      soundscapes.stop();
    }

    set({
      isPlayerOpen: true,
      activeExperience: experience,
      queue: items,
      currentIndex: 0,
      isPlaying: true,
      isControlsVisible: true,
      slideStartTime: Date.now(),
      currentSoundscape: sound
    });

    get().pingActivity();

    if (requestFullscreen && settings.autoFullscreenOnStart) {
      get().toggleFullscreen();
    }
  },

  startMood: (mood) => {
    const media = randomizer.getMediaByMood(mood);
    const catalog = useCatalogStore.getState().catalog;
    const items = media.length > 0 ? media : catalog.slice(0, 8);

    const exp: Experience = {
      id: `mood-${mood.toLowerCase()}`,
      name: `${mood} Escape`,
      tagline: `Immersive visuals calibrated for a ${mood.toLowerCase()} state of mind`,
      description: `A curated ambient flow of ${mood.toLowerCase()} imagery.`,
      coverUrl: items[0]?.url || '',
      mediaIds: items.map((i) => i.id),
      categories: [mood.toLowerCase()],
      moods: [mood.toLowerCase()],
      transition: 'crossfade',
      defaultDuration: 15,
      soundscape: items[0]?.suggestedSoundscape || 'none'
    };

    get().startExperience(exp);
  },

  startCategory: (categoryId) => {
    const media = randomizer.getMediaByCategory(categoryId);
    const catalog = useCatalogStore.getState().catalog;
    const items = media.length > 0 ? media : catalog.slice(0, 8);

    const exp: Experience = {
      id: `cat-${categoryId}`,
      name: `${categoryId.charAt(0).toUpperCase() + categoryId.slice(1)} Visuals`,
      tagline: `Curated showcase of ${categoryId}`,
      description: `Explore ambient imagery in ${categoryId}.`,
      coverUrl: items[0]?.url || '',
      mediaIds: items.map((i) => i.id),
      categories: [categoryId],
      moods: ['peaceful', 'calm'],
      transition: 'crossfade',
      defaultDuration: 15,
      soundscape: items[0]?.suggestedSoundscape || 'none'
    };

    get().startExperience(exp);
  },

  startCustomQueue: (items, title = 'Custom Ambient Flow', soundscape = 'none') => {
    if (items.length === 0) return;

    const exp: Experience = {
      id: `custom-queue-${Date.now()}`,
      name: title,
      tagline: `${items.length} curated visual moments`,
      description: 'Your selected personal visuals.',
      coverUrl: items[0].url,
      mediaIds: items.map((i) => i.id),
      categories: ['custom'],
      moods: ['peaceful'],
      transition: 'crossfade',
      defaultDuration: 15,
      soundscape
    };

    get().startExperience(exp, true, items);
  },

  startOneClickAmbient: () => {
    const settings = useSettingsStore.getState();
    let exp: Experience;

    if (settings.adaptiveMode) {
      exp = randomizer.getAdaptiveExperience();
    } else {
      const experiences = useCatalogStore.getState().experiences;
      exp = experiences[0];
    }

    get().startExperience(exp);
  },

  startSurpriseMe: () => {
    const exp = randomizer.getSurpriseExperience();
    get().startExperience(exp);
  },

  nextSlide: () => {
    const { queue, currentIndex } = get();
    if (queue.length === 0) return;

    const nextIdx = (currentIndex + 1) % queue.length;

    // Preload further ahead
    const ahead = [
      queue[(nextIdx + 1) % queue.length]?.url,
      queue[(nextIdx + 2) % queue.length]?.url
    ].filter(Boolean);
    preloader.preloadQueue(ahead);

    set({
      currentIndex: nextIdx,
      slideStartTime: Date.now()
    });
  },

  prevSlide: () => {
    const { queue, currentIndex } = get();
    if (queue.length === 0) return;

    const prevIdx = (currentIndex - 1 + queue.length) % queue.length;
    set({
      currentIndex: prevIdx,
      slideStartTime: Date.now()
    });
  },

  togglePlay: () => {
    set((state) => ({ isPlaying: !state.isPlaying }));
  },

  setPlaying: (playing) => {
    set({ isPlaying: playing });
  },

  showControls: () => {
    get().pingActivity();
  },

  hideControls: () => {
    const { controlsTimeoutId } = get();
    if (controlsTimeoutId) {
      window.clearTimeout(controlsTimeoutId);
    }
    set({ isControlsVisible: false, controlsTimeoutId: null });
  },

  pingActivity: () => {
    const { controlsTimeoutId } = get();
    if (controlsTimeoutId) {
      window.clearTimeout(controlsTimeoutId);
    }

    const newTimeout = window.setTimeout(() => {
      set({ isControlsVisible: false, controlsTimeoutId: null });
    }, 3200);

    set({ isControlsVisible: true, controlsTimeoutId: newTimeout });
  },

  exitPlayer: () => {
    const { controlsTimeoutId } = get();
    if (controlsTimeoutId) {
      window.clearTimeout(controlsTimeoutId);
    }
    soundscapes.stop();

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    set({
      isPlayerOpen: false,
      activeExperience: null,
      isPlaying: false,
      isFullscreen: false,
      currentSoundscape: 'none'
    });
  },

  toggleFullscreen: async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        set({ isFullscreen: true });
      } else {
        await document.exitFullscreen();
        set({ isFullscreen: false });
      }
    } catch {
      // Browser may reject without direct click or permission
      console.log('[Ambient] Fullscreen toggle handled gracefully');
    }
  },

  setFullscreenState: (isFullscreen) => {
    set({ isFullscreen });
  },

  setSoundscape: (soundscape) => {
    const settings = useSettingsStore.getState();
    set({ currentSoundscape: soundscape });
    if (soundscape === 'none' || settings.isMuted) {
      soundscapes.stop();
    } else {
      soundscapes.play(soundscape);
    }
  }
}));
