import { create } from 'zustand';
import type { MediaItem, Experience, Playlist } from '../types';
import { MEDIA_CATALOG } from '../data/catalog';
import { CURATED_EXPERIENCES } from '../data/experiences';
import { authService } from '../services/supabase/authService';
import { supabase, isSupabaseConfigured } from '../services/supabase/client';
import { useAuthStore } from './authStore';

interface CatalogState {
  catalog: MediaItem[];
  experiences: Experience[];
  customMixes: Experience[];
  userMedia: MediaItem[];
  favorites: string[]; // media item or experience IDs
  playlists: Playlist[];

  // Actions
  syncAdminMedia: (items: MediaItem[]) => void;
  addUserMedia: (items: MediaItem[]) => void;
  removeUserMedia: (id: string) => void;
  createCustomMix: (mix: Omit<Experience, 'id'>) => Experience;
  deleteCustomMix: (id: string) => void;
  toggleFavorite: (id: string) => boolean;
  loadUserFavorites: (userId: string | null) => Promise<void>;
  loadUserPlaylists: (userId: string | null) => Promise<void>;
  isFavorite: (id: string) => boolean;
  createPlaylist: (name: string, description?: string, mediaIds?: string[]) => Playlist;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (playlistId: string, mediaId: string) => void;
  removeFromPlaylist: (playlistId: string, mediaId: string) => void;
}

const getFavoritesKey = (userId: string) => `ambient_favorites_v1_${userId}`;
const getPlaylistsKey = (userId: string) => `ambient_playlists_v1_${userId}`;
const CUSTOM_MIXES_KEY = 'ambient_custom_mixes_v1';

const syncUserDataToSupabase = async (payload: { favorites?: string[]; playlists?: Playlist[] }) => {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.updateUser({
        data: payload
      });
    } catch (err) {
      console.warn('[CatalogStore] Supabase user data sync warning:', err);
    }
  }
};

const loadUserFavoritesFromStorage = (userId?: string | null): string[] => {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(getFavoritesKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const loadUserPlaylistsFromStorage = (userId?: string | null): Playlist[] => {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(getPlaylistsKey(userId));
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [
    {
      id: `default-morning-${userId.slice(0, 8)}`,
      name: 'My Morning Calm',
      description: 'Gentle sunrise peaks and tranquil mountain lakes.',
      mediaIds: ['mtn-001', 'mtn-003', 'for-001', 'cld-002'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      coverUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: `default-focus-${userId.slice(0, 8)}`,
      name: 'Workspace Zen',
      description: 'Minimalist architecture and calming botanical geometry.',
      mediaIds: ['arc-001', 'arc-002', 'arc-005', 'for-004'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      coverUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80'
    }
  ];
};

const loadCustomMixes = (): Experience[] => {
  try {
    const raw = localStorage.getItem(CUSTOM_MIXES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const loadAdminMedia = (): MediaItem[] => {
  try {
    const raw = localStorage.getItem('ambient_admin_category_media_v1');
    if (!raw) return [];
    const all: Record<string, MediaItem[]> = JSON.parse(raw);
    return Object.values(all).flat();
  } catch {
    return [];
  }
};

const initialAdminItems = loadAdminMedia();
const initialCatalog = [...initialAdminItems, ...MEDIA_CATALOG];

export const useCatalogStore = create<CatalogState>((set, get) => ({
  catalog: initialCatalog,
  experiences: CURATED_EXPERIENCES,
  customMixes: loadCustomMixes(),
  userMedia: [],
  favorites: loadUserFavoritesFromStorage(authService.getCurrentUser()?.id),
  playlists: loadUserPlaylistsFromStorage(authService.getCurrentUser()?.id),

  syncAdminMedia: (adminItems) => {
    set((state) => {
      // Remove any existing admin items from catalog and prepend fresh ones
      const adminIds = new Set(adminItems.map((i) => i.id));
      const cleanCatalog = state.catalog.filter((i) => !adminIds.has(i.id));
      return {
        catalog: [...adminItems, ...cleanCatalog]
      };
    });
  },

  addUserMedia: (items) => {
    set((state) => ({
      userMedia: [...state.userMedia, ...items],
      catalog: [...state.catalog, ...items]
    }));
  },

  removeUserMedia: (id) => {
    set((state) => ({
      userMedia: state.userMedia.filter((i) => i.id !== id),
      catalog: state.catalog.filter((i) => i.id !== id)
    }));
  },

  createCustomMix: (mixData) => {
    const newMix: Experience = {
      ...mixData,
      id: `custom-mix-${Date.now()}`,
      isCustom: true,
      isSmartMix: true,
      badge: 'Custom Mix'
    };
    set((state) => {
      const next = [newMix, ...state.customMixes];
      try {
        localStorage.setItem(CUSTOM_MIXES_KEY, JSON.stringify(next));
      } catch (err) {
        console.warn('[Ambient] Failed to save custom mix:', err);
      }
      return {
        customMixes: next,
        experiences: [newMix, ...state.experiences]
      };
    });
    return newMix;
  },

  deleteCustomMix: (id) => {
    set((state) => {
      const nextCustom = state.customMixes.filter((m) => m.id !== id);
      try {
        localStorage.setItem(CUSTOM_MIXES_KEY, JSON.stringify(nextCustom));
      } catch (err) {
        console.warn('[Ambient] Failed to delete custom mix:', err);
      }
      return {
        customMixes: nextCustom,
        experiences: state.experiences.filter((m) => m.id !== id)
      };
    });
  },

  toggleFavorite: (id) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) {
      useAuthStore.getState().openAuthModal('Please sign in or create an account to save your favorites.');
      return false;
    }

    set((state) => {
      const exists = state.favorites.includes(id);
      const next = exists ? state.favorites.filter((favId) => favId !== id) : [...state.favorites, id];
      try {
        localStorage.setItem(getFavoritesKey(currentUser.id), JSON.stringify(next));
      } catch (err) {
        console.warn('[Ambient] Failed to persist favorites:', err);
      }
      syncUserDataToSupabase({ favorites: next });
      return { favorites: next };
    });
    return true;
  },

  loadUserFavorites: async (userId) => {
    if (!userId) {
      set({ favorites: [] });
      return;
    }
    const cached = loadUserFavoritesFromStorage(userId);
    set({ favorites: cached });

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && Array.isArray(user.user_metadata?.favorites)) {
          const remoteFavs: string[] = user.user_metadata.favorites;
          const merged = Array.from(new Set([...cached, ...remoteFavs]));
          set({ favorites: merged });
          try {
            localStorage.setItem(getFavoritesKey(userId), JSON.stringify(merged));
          } catch {
            // ignore
          }
        }
      } catch (e) {
        console.warn('[CatalogStore] Failed to load remote favorites:', e);
      }
    }
  },

  loadUserPlaylists: async (userId) => {
    if (!userId) {
      set({ playlists: [] });
      return;
    }
    const cached = loadUserPlaylistsFromStorage(userId);
    set({ playlists: cached });

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && Array.isArray(user.user_metadata?.playlists)) {
          const remotePlaylists: Playlist[] = user.user_metadata.playlists;
          if (remotePlaylists.length > 0) {
            set({ playlists: remotePlaylists });
            try {
              localStorage.setItem(getPlaylistsKey(userId), JSON.stringify(remotePlaylists));
            } catch {
              // ignore
            }
          }
        }
      } catch (e) {
        console.warn('[CatalogStore] Failed to load remote playlists:', e);
      }
    }
  },

  isFavorite: (id) => {
    return get().favorites.includes(id);
  },

  createPlaylist: (name, description, mediaIds = []) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) {
      useAuthStore.getState().openAuthModal('Please sign in or create an account to create playlists.');
      throw new Error('User not authenticated');
    }

    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name,
      description,
      mediaIds,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      coverUrl: mediaIds.length > 0 ? get().catalog.find((i) => i.id === mediaIds[0])?.url : undefined
    };
    set((state) => {
      const next = [newPlaylist, ...state.playlists];
      try {
        localStorage.setItem(getPlaylistsKey(currentUser.id), JSON.stringify(next));
      } catch (err) {
        console.warn('[Ambient] Failed to persist playlists:', err);
      }
      syncUserDataToSupabase({ playlists: next });
      return { playlists: next };
    });
    return newPlaylist;
  },

  deletePlaylist: (id) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    set((state) => {
      const next = state.playlists.filter((p) => p.id !== id);
      try {
        localStorage.setItem(getPlaylistsKey(currentUser.id), JSON.stringify(next));
      } catch (err) {
        console.warn('[Ambient] Failed to delete playlist:', err);
      }
      syncUserDataToSupabase({ playlists: next });
      return { playlists: next };
    });
  },

  addToPlaylist: (playlistId, mediaId) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) {
      useAuthStore.getState().openAuthModal('Please sign in or create an account to manage playlists.');
      return;
    }

    set((state) => {
      const next = state.playlists.map((p) => {
        if (p.id === playlistId && !p.mediaIds.includes(mediaId)) {
          return {
            ...p,
            mediaIds: [...p.mediaIds, mediaId],
            updatedAt: Date.now(),
            coverUrl: p.coverUrl || state.catalog.find((i) => i.id === mediaId)?.url
          };
        }
        return p;
      });
      try {
        localStorage.setItem(getPlaylistsKey(currentUser.id), JSON.stringify(next));
      } catch (err) {
        console.warn('[Ambient] Failed to update playlist:', err);
      }
      syncUserDataToSupabase({ playlists: next });
      return { playlists: next };
    });
  },

  removeFromPlaylist: (playlistId, mediaId) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    set((state) => {
      const next = state.playlists.map((p) => {
        if (p.id === playlistId) {
          return {
            ...p,
            mediaIds: p.mediaIds.filter((id) => id !== mediaId),
            updatedAt: Date.now()
          };
        }
        return p;
      });
      try {
        localStorage.setItem(getPlaylistsKey(currentUser.id), JSON.stringify(next));
      } catch (err) {
        console.warn('[Ambient] Failed to remove from playlist:', err);
      }
      syncUserDataToSupabase({ playlists: next });
      return { playlists: next };
    });
  }
}));
