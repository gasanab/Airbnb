// In-memory cache implementation
interface CacheItem {
  data: any;
  expiresAt: number;
}

class InMemoryCache {
  private cache = new Map<string, CacheItem>();

  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key: string, data: any, ttlSeconds: number): void {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data, expiresAt });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Delete all keys that start with a prefix
  deleteByPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Create singleton instance
const cache = new InMemoryCache();

// Helper functions
export const getCache = (key: string): any | null => {
  return cache.get(key);
};

export const setCache = (key: string, data: any, ttlSeconds: number): void => {
  cache.set(key, data, ttlSeconds);
};

export const deleteCache = (key: string): void => {
  cache.delete(key);
};

export const clearCache = (): void => {
  cache.clear();
};

export const deleteCacheByPrefix = (prefix: string): void => {
  cache.deleteByPrefix(prefix);
};

export const getCacheStats = () => {
  return cache.getStats();
};

// Cache key generators
export const generateCacheKey = (prefix: string, params: Record<string, any>): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {} as Record<string, any>);
  
  return `${prefix}:${JSON.stringify(sortedParams)}`;
};

export default cache;