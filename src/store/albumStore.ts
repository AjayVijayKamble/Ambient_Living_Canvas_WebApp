import { create } from 'zustand';
import type { UserAlbum, UserPhoto, MediaItem } from '../types';
import { albumService } from '../services/supabase/albumService';
import { usePlayerStore } from './playerStore';
import { useSettingsStore } from './settingsStore';

interface AlbumState {
  albums: UserAlbum[];
  isLoading: boolean;
  activeAlbum: UserAlbum | null;

  // Actions
  loadAlbums: (userId: string) => Promise<void>;
  createAlbum: (albumData: Omit<UserAlbum, 'id' | 'photos' | 'createdAt' | 'updatedAt'>) => Promise<UserAlbum>;
  addPhotosToAlbum: (albumId: string, userId: string, photos: Array<{ title: string; url: string }>) => Promise<void>;
  deleteAlbum: (albumId: string) => Promise<void>;
  deletePhoto: (albumId: string, photoId: string) => Promise<void>;
  playAlbumScreensaver: (album: UserAlbum) => void;
  setActiveAlbum: (album: UserAlbum | null) => void;
  reset: () => void;
}

const LOCAL_ACTIVE_ALBUM_ID_KEY = 'ambient_active_album_id_v1';

export const useAlbumStore = create<AlbumState>((set, get) => ({
  albums: [],
  isLoading: false,
  activeAlbum: null,

  reset: () => {
    try {
      localStorage.removeItem(LOCAL_ACTIVE_ALBUM_ID_KEY);
    } catch {
      // ignore
    }
    set({ albums: [], activeAlbum: null, isLoading: false });
  },

  loadAlbums: async (userId: string) => {
    set({ isLoading: true });
    try {
      const albums = await albumService.getUserAlbums(userId);
      const savedAlbumId = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_ACTIVE_ALBUM_ID_KEY) : null;
      set((state) => {
        let active = state.activeAlbum;
        if (active) {
          active = albums.find((a) => a.id === active?.id) || active;
        } else if (savedAlbumId) {
          active = albums.find((a) => a.id === savedAlbumId) || null;
        }
        return {
          albums,
          activeAlbum: active,
          isLoading: false
        };
      });
    } catch {
      set({ isLoading: false });
    }
  },

  createAlbum: async (albumData) => {
    const newAlbum = await albumService.createAlbum(albumData);
    set((state) => ({
      albums: [newAlbum, ...state.albums],
      activeAlbum: newAlbum
    }));
    return newAlbum;
  },

  addPhotosToAlbum: async (albumId, userId, photos) => {
    const added = await albumService.addPhotosToAlbum(albumId, userId, photos);
    set((state) => {
      const nextAlbums = state.albums.map((alb) => {
        if (alb.id === albumId) {
          return {
            ...alb,
            coverUrl: alb.coverUrl || photos[0]?.url,
            photos: [...alb.photos, ...added],
            updatedAt: new Date().toISOString()
          };
        }
        return alb;
      });

      const nextActiveAlbum =
        state.activeAlbum?.id === albumId
          ? {
              ...state.activeAlbum,
              coverUrl: state.activeAlbum.coverUrl || photos[0]?.url,
              photos: [...state.activeAlbum.photos, ...added],
              updatedAt: new Date().toISOString()
            }
          : state.activeAlbum;

      return {
        albums: nextAlbums,
        activeAlbum: nextActiveAlbum
      };
    });
  },

  deleteAlbum: async (albumId) => {
    await albumService.deleteAlbum(albumId);
    set((state) => ({
      albums: state.albums.filter((a) => a.id !== albumId),
      activeAlbum: state.activeAlbum?.id === albumId ? null : state.activeAlbum
    }));
  },

  deletePhoto: async (albumId, photoId) => {
    await albumService.deletePhoto(albumId, photoId);
    set((state) => {
      const nextAlbums = state.albums.map((alb) => {
        if (alb.id === albumId) {
          return {
            ...alb,
            photos: alb.photos.filter((p) => p.id !== photoId)
          };
        }
        return alb;
      });

      const nextActiveAlbum =
        state.activeAlbum?.id === albumId
          ? {
              ...state.activeAlbum,
              photos: state.activeAlbum.photos.filter((p) => p.id !== photoId)
            }
          : state.activeAlbum;

      return {
        albums: nextAlbums,
        activeAlbum: nextActiveAlbum
      };
    });
  },

  playAlbumScreensaver: (album: UserAlbum) => {
    if (!album.photos || album.photos.length === 0) return;

    // Convert UserPhotos to MediaItems
    const mediaQueue: MediaItem[] = album.photos.map((p) => ({
      id: p.id,
      title: p.title,
      url: p.url,
      thumbnailUrl: p.url,
      categories: ['user-album', album.name],
      moods: ['peaceful'],
      source: 'local',
      width: p.width || 1920,
      height: p.height || 1080,
      type: 'image',
      particleEffect: album.particleEffect,
      suggestedSoundscape: album.soundscape
    }));

    // Apply custom transition & duration preferences
    const { updateSettings } = useSettingsStore.getState();
    if (album.transition) {
      updateSettings({ transition: album.transition });
    }
    if (album.defaultDuration) {
      updateSettings({ slideshowDuration: album.defaultDuration });
    }

    // Launch player
    const { startCustomQueue } = usePlayerStore.getState();
    startCustomQueue(mediaQueue, album.name, album.soundscape);
  },

  setActiveAlbum: (album) => {
    try {
      if (album?.id) {
        localStorage.setItem(LOCAL_ACTIVE_ALBUM_ID_KEY, album.id);
      } else {
        localStorage.removeItem(LOCAL_ACTIVE_ALBUM_ID_KEY);
      }
    } catch {
      // ignore
    }
    set({ activeAlbum: album });
  }
}));
