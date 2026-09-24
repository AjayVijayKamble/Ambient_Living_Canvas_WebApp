import { create } from 'zustand';
import type { UserProfile } from '../types';
import { authService } from '../services/supabase/authService';
import { useAlbumStore } from './albumStore';
import { useCatalogStore } from './catalogStore';

interface AuthState {
  user: UserProfile | null;
  isAdmin: boolean;
  isAuthModalOpen: boolean;
  authModalPrompt: string | null;
  isChangePasswordOpen: boolean;
  isAdminModalOpen: boolean;
  isContactModalOpen: boolean;
  isLoading: boolean;

  // Actions
  openAuthModal: (prompt?: string) => void;
  closeAuthModal: () => void;
  openChangePassword: () => void;
  closeChangePassword: () => void;
  openAdminModal: () => void;
  closeAdminModal: () => void;
  openContactModal: () => void;
  closeContactModal: () => void;

  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (username: string, email: string, password: string, fullName?: string, country?: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (newPassword: string, oldPassword?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkSession: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: authService.getCurrentUser(),
  isAdmin: authService.getCurrentUser()?.role === 'admin',
  isAuthModalOpen: false,
  authModalPrompt: null,
  isChangePasswordOpen: false,
  isAdminModalOpen: false,
  isContactModalOpen: false,
  isLoading: false,

  openAuthModal: (prompt) => set({ isAuthModalOpen: true, authModalPrompt: typeof prompt === 'string' ? prompt : null }),
  closeAuthModal: () => set({ isAuthModalOpen: false, authModalPrompt: null }),

  openChangePassword: () => set({ isChangePasswordOpen: true }),
  closeChangePassword: () => set({ isChangePasswordOpen: false }),

  openAdminModal: () => {
    if (get().isAdmin) {
      set({ isAdminModalOpen: true });
    } else {
      set({ isAuthModalOpen: true });
    }
  },
  closeAdminModal: () => set({ isAdminModalOpen: false }),

  openContactModal: () => set({ isContactModalOpen: true }),
  closeContactModal: () => set({ isContactModalOpen: false }),

  login: async (identifier, password) => {
    set({ isLoading: true });
    try {
      const { user, error } = await authService.signIn(identifier, password);
      if (error || !user) {
        set({ isLoading: false });
        return { success: false, error: error || 'Failed to sign in' };
      }
      set({
        user,
        isAdmin: user.role === 'admin',
        isLoading: false,
        isAuthModalOpen: false,
        authModalPrompt: null
      });
      useCatalogStore.getState().loadUserFavorites(user.id);
      useCatalogStore.getState().loadUserPlaylists(user.id);
      useAlbumStore.getState().loadAlbums(user.id);
      return { success: true };
    } catch (err: unknown) {
      set({ isLoading: false });
      return { success: false, error: (err as Error).message };
    }
  },

  signUp: async (username, email, password, fullName, country) => {
    set({ isLoading: true });
    try {
      const { user, error } = await authService.signUp(username, email, password, fullName, country);
      if (error || !user) {
        set({ isLoading: false });
        return { success: false, error: error || 'Failed to sign up' };
      }
      set({
        user,
        isAdmin: user.role === 'admin',
        isLoading: false,
        isAuthModalOpen: false,
        authModalPrompt: null
      });
      useCatalogStore.getState().loadUserFavorites(user.id);
      useCatalogStore.getState().loadUserPlaylists(user.id);
      useAlbumStore.getState().loadAlbums(user.id);
      return { success: true };
    } catch (err: unknown) {
      set({ isLoading: false });
      return { success: false, error: (err as Error).message };
    }
  },

  changePassword: async (newPassword, oldPassword) => {
    return await authService.changePassword(newPassword, oldPassword);
  },

  logout: async () => {
    await authService.signOut();
    useAlbumStore.getState().reset();
    useCatalogStore.getState().loadUserFavorites(null);
    useCatalogStore.getState().loadUserPlaylists(null);
    set({ user: null, isAdmin: false, isAdminModalOpen: false });
  },

  checkSession: () => {
    const current = authService.getCurrentUser();
    set({ user: current, isAdmin: current?.role === 'admin' });
    if (current) {
      useCatalogStore.getState().loadUserFavorites(current.id);
      useCatalogStore.getState().loadUserPlaylists(current.id);
      useAlbumStore.getState().loadAlbums(current.id);
    } else {
      useCatalogStore.getState().loadUserFavorites(null);
      useCatalogStore.getState().loadUserPlaylists(null);
      useAlbumStore.getState().reset();
    }
  }
}));
