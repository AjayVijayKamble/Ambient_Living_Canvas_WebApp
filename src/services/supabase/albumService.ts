import { supabase, isSupabaseConfigured } from './client';
import type { UserAlbum, UserPhoto } from '../../types';

const LOCAL_ALBUMS_KEY = 'ambient_user_albums_v1';

const getLocalAlbums = (): UserAlbum[] => {
  try {
    const raw = localStorage.getItem(LOCAL_ALBUMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setLocalAlbums = (albums: UserAlbum[]): void => {
  try {
    localStorage.setItem(LOCAL_ALBUMS_KEY, JSON.stringify(albums));
  } catch (err) {
    console.warn('[AlbumService] Local storage quota reached:', err);
  }
};

export const albumService = {
  async getUserAlbums(userId: string): Promise<UserAlbum[]> {
    if (!userId || userId === 'guest') {
      return [];
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: albums, error } = await supabase
          .from('user_albums')
          .select(`
            id,
            user_id,
            name,
            description,
            cover_url,
            transition,
            default_duration,
            soundscape,
            particle_effect,
            is_default_screensaver,
            created_at,
            updated_at,
            photos:user_photos (
              id,
              album_id,
              user_id,
              title,
              url,
              width,
              height,
              sort_order,
              created_at
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && albums) {
          return albums.map((a) => ({
            id: a.id,
            userId: a.user_id,
            name: a.name,
            description: a.description,
            coverUrl: a.cover_url,
            transition: a.transition || 'crossfade',
            defaultDuration: a.default_duration || 10,
            soundscape: a.soundscape || 'none',
            particleEffect: a.particle_effect || 'none',
            isDefaultScreensaver: Boolean(a.is_default_screensaver),
            photos: (a.photos || []).map((p: any) => ({
              id: p.id,
              albumId: p.album_id,
              userId: p.user_id,
              title: p.title,
              url: p.url,
              width: p.width || 1920,
              height: p.height || 1080,
              sortOrder: p.sort_order || 0,
              createdAt: p.created_at
            })),
            createdAt: a.created_at,
            updatedAt: a.updated_at
          }));
        }
      } catch (err) {
        console.warn('[AlbumService] Failed to load from Supabase:', err);
      }
    }

    // Local fallback - strictly isolate by userId
    const all = getLocalAlbums();
    return all.filter((a) => a.userId === userId);
  },

  async createAlbum(albumData: Omit<UserAlbum, 'id' | 'photos' | 'createdAt' | 'updatedAt'>): Promise<UserAlbum> {
    const newAlbum: UserAlbum = {
      ...albumData,
      id: `album-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      photos: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('user_albums')
          .insert({
            user_id: albumData.userId,
            name: albumData.name,
            description: albumData.description,
            cover_url: albumData.coverUrl,
            transition: albumData.transition,
            default_duration: albumData.defaultDuration,
            soundscape: albumData.soundscape,
            particle_effect: albumData.particleEffect,
            is_default_screensaver: albumData.isDefaultScreensaver || false
          })
          .select()
          .single();

        if (!error && data) {
          newAlbum.id = data.id;
        }
      } catch (err) {
        console.warn('[AlbumService] Error creating album in Supabase:', err);
      }
    }

    // Update local cache
    const current = getLocalAlbums();
    setLocalAlbums([newAlbum, ...current]);
    return newAlbum;
  },

  async addPhotosToAlbum(albumId: string, userId: string, photos: Array<{ title: string; url: string }>): Promise<UserPhoto[]> {
    let createdPhotos: UserPhoto[] = photos.map((p, idx) => ({
      id: `photo-${Date.now()}-${idx}`,
      albumId,
      userId,
      title: p.title,
      url: p.url,
      width: 1920,
      height: 1080,
      sortOrder: idx,
      createdAt: new Date().toISOString()
    }));

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('user_photos')
          .insert(
            photos.map((p, idx) => ({
              album_id: albumId,
              user_id: userId,
              title: p.title,
              url: p.url,
              sort_order: idx
            }))
          )
          .select();

        if (!error && data && data.length > 0) {
          createdPhotos = data.map((p: any) => ({
            id: p.id,
            albumId: p.album_id,
            userId: p.user_id,
            title: p.title,
            url: p.url,
            width: p.width || 1920,
            height: p.height || 1080,
            sortOrder: p.sort_order || 0,
            createdAt: p.created_at
          }));

          // If album coverUrl is missing, set first photo as cover
          await supabase
            .from('user_albums')
            .update({ cover_url: photos[0]?.url, updated_at: new Date().toISOString() })
            .eq('id', albumId)
            .is('cover_url', null);
        }
      } catch (err) {
        console.warn('[AlbumService] Error saving photos in Supabase:', err);
      }
    }

    // Local fallback update
    const all = getLocalAlbums();
    const updated = all.map((a) => {
      if (a.id === albumId) {
        return {
          ...a,
          coverUrl: a.coverUrl || photos[0]?.url,
          photos: [...a.photos, ...createdPhotos],
          updatedAt: new Date().toISOString()
        };
      }
      return a;
    });
    setLocalAlbums(updated);

    return createdPhotos;
  },

  async deleteAlbum(albumId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('user_albums').delete().eq('id', albumId);
      } catch (err) {
        console.warn('[AlbumService] Supabase delete failed:', err);
      }
    }

    const all = getLocalAlbums();
    setLocalAlbums(all.filter((a) => a.id !== albumId));
  },

  async deletePhoto(albumId: string, photoId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('user_photos').delete().eq('id', photoId);
      } catch (err) {
        console.warn('[AlbumService] Supabase photo delete error:', err);
      }
    }

    const all = getLocalAlbums();
    const updated = all.map((a) => {
      if (a.id === albumId) {
        return {
          ...a,
          photos: a.photos.filter((p) => p.id !== photoId)
        };
      }
      return a;
    });
    setLocalAlbums(updated);
  }
};
