export class ImagePreloader {
  private cache: Map<string, HTMLImageElement> = new Map();
  private maxCacheSize = 16;
  private preloadingUrls: Set<string> = new Set();

  /**
   * Preload an image by URL. Returns a promise that resolves when image is loaded and decoded.
   */
  public async preload(url: string): Promise<boolean> {
    if (!url) return false;
    if (this.cache.has(url)) return true;
    if (this.preloadingUrls.has(url)) return true;

    this.preloadingUrls.add(url);

    try {
      const img = new Image();
      img.src = url;

      // Wait for load
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      });

      // Decode if supported to ensure GPU raster is ready
      if ('decode' in img && typeof img.decode === 'function') {
        try {
          await img.decode();
        } catch {
          // Ignore decode errors on non-critical decode
        }
      }

      this.addToCache(url, img);
      this.preloadingUrls.delete(url);
      return true;
    } catch (err) {
      console.warn(`[Ambient Preloader] Skipped invalid image:`, err);
      this.preloadingUrls.delete(url);
      return false;
    }
  }

  /**
   * Preloads a rolling window of images (e.g. current + 1, current + 2)
   */
  public preloadQueue(urls: string[]) {
    urls.slice(0, 3).forEach(url => {
      this.preload(url);
    });
  }

  private addToCache(url: string, img: HTMLImageElement) {
    if (this.cache.size >= this.maxCacheSize) {
      // Evict oldest item to prevent memory growth
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(url, img);
  }

  public clear() {
    this.cache.clear();
    this.preloadingUrls.clear();
  }
}

export const preloader = new ImagePreloader();
