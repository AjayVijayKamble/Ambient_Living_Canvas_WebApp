import { supabase, isSupabaseConfigured } from './client';
import type { UserFeedback } from '../../types';

const LOCAL_FEEDBACK_KEY = 'ambient_local_feedback_v1';

export const feedbackService = {
  async submitFeedback(data: Omit<UserFeedback, 'id' | 'status' | 'createdAt'>): Promise<{ success: boolean; error?: string }> {
    const feedbackItem: UserFeedback = {
      ...data,
      id: `feedback-${Date.now()}`,
      status: 'new',
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('feedback').insert({
          user_id: data.userId && data.userId.startsWith('admin-') ? null : data.userId,
          email: data.email,
          name: data.name,
          type: data.type,
          message: data.message,
          status: 'new'
        });

        if (error) {
          console.warn('[FeedbackService] Supabase insert error:', error);
        } else {
          return { success: true };
        }
      } catch (err: unknown) {
        console.warn('[FeedbackService] Submission error:', err);
      }
    }

    // Local fallback
    try {
      const raw = localStorage.getItem(LOCAL_FEEDBACK_KEY);
      const all: UserFeedback[] = raw ? JSON.parse(raw) : [];
      all.unshift(feedbackItem);
      localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(all));
    } catch {
      // ignore
    }

    return { success: true };
  },

  async getAllFeedback(): Promise<UserFeedback[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('feedback')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((item: any) => ({
            id: item.id,
            userId: item.user_id,
            email: item.email,
            name: item.name,
            type: item.type,
            message: item.message,
            status: item.status,
            createdAt: item.created_at
          }));
        }
      } catch (err) {
        console.warn('[FeedbackService] Failed to load feedback from Supabase:', err);
      }
    }

    // Local fallback
    try {
      const raw = localStorage.getItem(LOCAL_FEEDBACK_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async markAsReviewed(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('feedback').update({ status: 'reviewed' }).eq('id', id);
      } catch {
        // ignore
      }
    }

    try {
      const raw = localStorage.getItem(LOCAL_FEEDBACK_KEY);
      if (raw) {
        const all: UserFeedback[] = JSON.parse(raw);
        const updated = all.map((f) => (f.id === id ? { ...f, status: 'reviewed' as const } : f));
        localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(updated));
      }
    } catch {
      // ignore
    }
  }
};
