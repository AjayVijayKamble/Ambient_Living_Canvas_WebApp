import type { MediaItem, Experience } from '../types';
import { MEDIA_CATALOG } from '../data/catalog';
import { CURATED_EXPERIENCES } from '../data/experiences';

export class SmartRandomizer {
  private history: string[] = [];
  private maxHistoryLength = 20;

  /**
   * Intelligently sorts and selects the next media items from a pool
   * avoiding immediate repetition of locations, categories, and IDs.
   */
  public getSmartPlaylist(pool: MediaItem[]): MediaItem[] {
    if (pool.length <= 1) return [...pool];

    const shuffled: MediaItem[] = [];
    const remaining = [...pool];
    let lastLocation: string | undefined;

    while (remaining.length > 0) {
      // Find items whose location does not match the immediate last item
      const candidates = remaining.filter(
        item => !lastLocation || item.location !== lastLocation || remaining.length === 1
      );

      const chosenIndex = Math.floor(Math.random() * (candidates.length > 0 ? candidates.length : remaining.length));
      const chosenItem = candidates.length > 0 ? candidates[chosenIndex] : remaining[chosenIndex];

      shuffled.push(chosenItem);
      lastLocation = chosenItem.location;

      const idxInRemaining = remaining.findIndex(item => item.id === chosenItem.id);
      if (idxInRemaining !== -1) {
        remaining.splice(idxInRemaining, 1);
      }
    }

    return shuffled;
  }

  /**
   * Get an intelligent experience based on the current local time of day
   */
  public getAdaptiveExperience(): Experience {
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 10) {
      // Morning / Sunrise
      const exp = CURATED_EXPERIENCES.find(e => e.id === 'calm-mix-exp') || CURATED_EXPERIENCES[0];
      return {
        ...exp,
        tagline: 'Morning First Light · Calming Awakening'
      };
    } else if (hour >= 10 && hour < 17) {
      // Daytime / Focus & Productivity
      const exp = CURATED_EXPERIENCES.find(e => e.id === 'minimal-zen-focus') || CURATED_EXPERIENCES[0];
      return {
        ...exp,
        tagline: 'Deep Work Ambient · Non-distracting Focus'
      };
    } else if (hour >= 17 && hour < 20) {
      // Golden Hour / Sunset
      const exp = CURATED_EXPERIENCES.find(e => e.id === 'cinematic-mix-exp') || CURATED_EXPERIENCES[0];
      return {
        ...exp,
        tagline: 'Golden Hour Reflections · Sunset Horizon'
      };
    } else if (hour >= 20 && hour < 24) {
      // Evening / City Night / Cozy
      const exp = CURATED_EXPERIENCES.find(e => e.id === 'tokyo-cyber-night') || CURATED_EXPERIENCES[1];
      return {
        ...exp,
        tagline: 'Nocturnal City Glow · Midnight Atmosphere'
      };
    } else {
      // Late Night / Deep Space & Aurora
      const exp = CURATED_EXPERIENCES.find(e => e.id === 'deep-space-odyssey') || CURATED_EXPERIENCES[2];
      return {
        ...exp,
        tagline: 'Deep Cosmic Stillness · Midnight Journey'
      };
    }
  }

  /**
   * Generate an immediate "Surprise Me" journey
   */
  public getSurpriseExperience(): Experience {
    const experiences = [...CURATED_EXPERIENCES];
    const randomIndex = Math.floor(Math.random() * experiences.length);
    const chosen = experiences[randomIndex];

    return {
      ...chosen,
      name: `Surprise: ${chosen.name}`,
      tagline: 'An unexpected visual escape tailored for your idle monitor'
    };
  }

  /**
   * Filter catalog items by mood key
   */
  public getMediaByMood(mood: string): MediaItem[] {
    const normalized = mood.toLowerCase();
    return MEDIA_CATALOG.filter(item => 
      item.moods.some(m => m.toLowerCase().includes(normalized)) ||
      item.categories.some(c => c.toLowerCase().includes(normalized))
    );
  }

  /**
   * Filter catalog items by category key
   */
  public getMediaByCategory(categoryId: string): MediaItem[] {
    return MEDIA_CATALOG.filter(item => 
      item.categories.includes(categoryId) ||
      item.moods.includes(categoryId)
    );
  }
}

export const randomizer = new SmartRandomizer();
