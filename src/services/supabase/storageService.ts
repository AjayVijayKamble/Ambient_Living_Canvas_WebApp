import { supabase, isSupabaseConfigured } from './client';

export const storageService = {
  async uploadCategoryMedia(file: File, filename?: string): Promise<{ url: string; error?: string }> {
    const cleanName = filename || `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.storage
          .from('screensaver-media')
          .upload(`categories/${cleanName}`, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) {
          console.warn('[Storage] Supabase upload failed, falling back to data URL:', error);
        } else if (data?.path) {
          const { data: publicData } = supabase.storage
            .from('screensaver-media')
            .getPublicUrl(data.path);

          return { url: publicData.publicUrl };
        }
      } catch (err: unknown) {
        console.warn('[Storage] Upload error:', err);
      }
    }

    // Local / Offline fallback: Convert to Data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ url: reader.result as string });
      reader.onerror = () => resolve({ url: '', error: 'Failed to read file' });
      reader.readAsDataURL(file);
    });
  },

  async uploadUserPhoto(userId: string, file: File): Promise<{ url: string; error?: string }> {
    const cleanName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.storage
          .from('user-photos')
          .upload(`${userId}/${cleanName}`, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (!error && data?.path) {
          const { data: publicData } = supabase.storage
            .from('user-photos')
            .getPublicUrl(data.path);

          return { url: publicData.publicUrl };
        }
      } catch (err) {
        console.warn('[Storage] User photo upload fallback:', err);
      }
    }

    // Local fallback: convert to Data URL so it persists in storage
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ url: reader.result as string });
      reader.onerror = () => resolve({ url: '', error: 'Failed to read file' });
      reader.readAsDataURL(file);
    });
  }
};
