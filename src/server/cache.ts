/**
 * Simple in-memory cache for tRPC queries
 */

import { env } from "~/env";

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  constructor() {
    // Cleanup expired entries every minute
    if (typeof setInterval !== "undefined") {
      setInterval(() => this.cleanup(), 60_000);
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  set<T>(key: string, data: T, ttlSeconds: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  invalidateAll(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton instance
const globalForCache = globalThis as unknown as {
  memoryCache: MemoryCache | undefined;
};

export const cache = globalForCache.memoryCache ?? new MemoryCache();

if (env.NODE_ENV !== "production") {
  globalForCache.memoryCache = cache;
}

// Cache keys
export const CACHE_KEYS = {
  members: (params: string) => `members:${params}`,
  skills: "skills:all",
  skillSearch: (query: string) => `skills:search:${query}`,
  projects: (params: string) => `projects:${params}`,
  project: (id: string) => `project:${id}`,
  user: (id: string) => `user:${id}`,
} as const;

// Cache durations in seconds
export const CACHE_TTL = {
  short: 30,      // 30 seconds
  medium: 120,    // 2 minutes
  long: 300,      // 5 minutes
} as const;

/**
 * Helper to get or set cache
 * Note: Uses `undefined` to indicate cache miss, so `null` values can be cached properly.
 */
export async function cached<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  const existing = cache.get<T>(key);
  if (existing !== null && existing !== undefined) {
    return existing;
  }
  const data = await fn();
  cache.set(key, data, ttl);
  return data;
}
