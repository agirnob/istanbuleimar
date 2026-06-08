// In-memory cache for KEOS data (mahalle, sokak, kapi lists)
// Mahalle data is relatively static and doesn't need to be fetched on every request.

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry<unknown>>();

// Default TTL: 1 hour (3600 seconds)
const DEFAULT_TTL = 3600 * 1000;

function getCacheKey(municipality: string, type: string, params: string): string {
  return `${municipality}:${type}:${params}`;
}

export function getCached<T>(municipality: string, type: string, params: string): T | null {
  const key = getCacheKey(municipality, type, params);
  const entry = cache.get(key) as CacheEntry<T> | undefined;

  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

export function setCache<T>(municipality: string, type: string, params: string, data: T, ttl: number = DEFAULT_TTL): void {
  const key = getCacheKey(municipality, type, params);
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttl,
  });
}

export function clearCache(municipality?: string): void {
  if (municipality) {
    // Clear only specific municipality
    const keysToDelete: string[] = [];
    for (const key of cache.keys()) {
      if (key.startsWith(`${municipality}:`)) {
        keysToDelete.push(key);
      }
    }
    for (const key of keysToDelete) {
      cache.delete(key);
    }
  } else {
    cache.clear();
  }
}

export function getCacheStats(): { total: number } {
  // Clean expired entries
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now > entry.expiresAt) {
      cache.delete(key);
    }
  }
  return { total: cache.size };
}
