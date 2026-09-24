import { supabase, isSupabaseConfigured } from './client';
import type { UserAdminView, MediaItem } from '../../types';

const LOCAL_OVERRIDE_MEDIA_KEY = 'ambient_admin_category_media_v1';
const LOCAL_USERS_KEY = 'ambient_local_users_v1';
const LOCAL_ALBUMS_KEY = 'ambient_user_albums_v1';

export const adminService = {
  // 1. User Directory & Analytics
  async getAllUsers(): Promise<UserAdminView[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select(`
            id,
            username,
            email,
            full_name,
            country,
            role,
            avatar_url,
            last_sign_in_at,
            created_at,
            user_albums (
              id,
              name,
              cover_url,
              user_photos ( id )
            )
          `)
          .order('last_sign_in_at', { ascending: false });

        if (!error && profiles) {
          return profiles.map((p: any) => {
            const albums = p.user_albums || [];
            let photoCount = 0;
            albums.forEach((alb: any) => {
              photoCount += (alb.user_photos || []).length;
            });

            return {
              id: p.id,
              username: p.username || 'User',
              email: p.email,
              fullName: p.full_name,
              country: p.country || 'Unknown',
              role: p.role || 'user',
              avatarUrl: p.avatar_url,
              lastSignInAt: p.last_sign_in_at || p.created_at,
              createdAt: p.created_at,
              albumCount: albums.length,
              photoCount,
              albums
            };
          });
        }
      } catch (err) {
        console.warn('[AdminService] Supabase users fetch failed:', err);
      }
    }

    // Local fallback for offline/demo mode
    try {
      const usersRaw = localStorage.getItem(LOCAL_USERS_KEY);
      const albumsRaw = localStorage.getItem(LOCAL_ALBUMS_KEY);
      const localUsers = usersRaw ? JSON.parse(usersRaw) : [];
      const localAlbums = albumsRaw ? JSON.parse(albumsRaw) : [];

      const adminUser: UserAdminView = {
        id: 'admin-iamavk265',
        username: 'iamavk265',
        email: 'iamavk265@ambient.local',
        fullName: 'Ajay V. Kamble (Admin)',
        country: 'India',
        role: 'admin',
        lastSignInAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        albumCount: localAlbums.length,
        photoCount: localAlbums.reduce((acc: number, alb: any) => acc + (alb.photos?.length || 0), 0),
        albums: localAlbums
      };

      const userViews: UserAdminView[] = localUsers.map((u: any) => {
        const userAlbums = localAlbums.filter((a: any) => a.userId === u.id);
        return {
          ...u,
          albumCount: userAlbums.length,
          photoCount: userAlbums.reduce((acc: number, a: any) => acc + (a.photos?.length || 0), 0),
          albums: userAlbums
        };
      });

      return [adminUser, ...userViews];
    } catch {
      return [];
    }
  },

  // 2. Category Media Manager
  async getCategoryMedia(categoryId: string): Promise<MediaItem[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('category_media')
          .select('*')
          .eq('category_id', categoryId)
          .order('sort_order', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((item: any) => ({
            id: item.id,
            title: item.title,
            url: item.url,
            thumbnailUrl: item.thumbnail_url || item.url,
            categories: [item.category_id],
            moods: [item.suggested_soundscape || 'peaceful'],
            source: (item.source || 'curated') as any,
            author: item.author,
            authorUrl: item.author_url,
            width: item.width || 3840,
            height: item.height || 2160,
            type: 'image',
            focalPoint: item.focal_point,
            particleEffect: item.particle_effect || 'none',
            suggestedSoundscape: item.suggested_soundscape || 'none',
            colorHint: item.color_hint
          }));
        }
      } catch (err) {
        console.warn('[AdminService] Supabase category fetch failed:', err);
      }
    }

    // Local fallback
    try {
      const raw = localStorage.getItem(LOCAL_OVERRIDE_MEDIA_KEY);
      const all: Record<string, MediaItem[]> = raw ? JSON.parse(raw) : {};
      return all[categoryId] || [];
    } catch {
      return [];
    }
  },

  async addMediaToCategory(categoryId: string, item: Omit<MediaItem, 'id'>): Promise<MediaItem> {
    const newItem: MediaItem = {
      ...item,
      id: `admin-media-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('category_media')
          .insert({
            category_id: categoryId,
            title: item.title,
            url: item.url,
            thumbnail_url: item.thumbnailUrl || item.url,
            source: item.source,
            author: item.author,
            author_url: item.authorUrl,
            focal_point: item.focalPoint,
            particle_effect: item.particleEffect,
            suggested_soundscape: item.suggestedSoundscape,
            color_hint: item.colorHint,
            width: item.width,
            height: item.height
          })
          .select()
          .single();

        if (!error && data) {
          newItem.id = data.id;
        }
      } catch (err) {
        console.warn('[AdminService] Supabase add media failed:', err);
      }
    }

    // Local fallback update
    try {
      const raw = localStorage.getItem(LOCAL_OVERRIDE_MEDIA_KEY);
      const all: Record<string, MediaItem[]> = raw ? JSON.parse(raw) : {};
      all[categoryId] = [newItem, ...(all[categoryId] || [])];
      localStorage.setItem(LOCAL_OVERRIDE_MEDIA_KEY, JSON.stringify(all));
    } catch (err) {
      console.warn('[AdminService] Local storage update failed:', err);
    }

    return newItem;
  },

  async deleteCategoryMedia(categoryId: string, mediaId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('category_media').delete().eq('id', mediaId);
      } catch (err) {
        console.warn('[AdminService] Supabase delete media failed:', err);
      }
    }

    try {
      const raw = localStorage.getItem(LOCAL_OVERRIDE_MEDIA_KEY);
      const all: Record<string, MediaItem[]> = raw ? JSON.parse(raw) : {};
      if (all[categoryId]) {
        all[categoryId] = all[categoryId].filter((m) => m.id !== mediaId);
        localStorage.setItem(LOCAL_OVERRIDE_MEDIA_KEY, JSON.stringify(all));
      }
    } catch {
      // ignore
    }
  }
};
