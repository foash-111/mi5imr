// Simple in-memory cache for development
// For production, use Redis or similar

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class Cache {
  private cache = new Map<string, CacheItem<any>>()

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    const isExpired = Date.now() - item.timestamp > item.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean expired items
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

export const cache = new Cache()

// Cache keys
export const CACHE_KEYS = {
  CONTENT_TYPES: 'content-types',
  CATEGORIES: 'categories',
  FEATURED_CONTENT: 'featured-content',
  POPULAR_CONTENT: 'popular-content',
  USER_PROFILE: (userId: string) => `user-profile-${userId}`,
  CONTENT_DETAIL: (slug: string) => `content-detail-${slug}`,
  RELATED_CONTENT: (contentId: string) => `related-content-${contentId}`,
} as const

// Cache utilities
export function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
): Promise<T> {
  const cached = cache.get<T>(key)
  if (cached) {
    return Promise.resolve(cached)
  }

  return fn().then(result => {
    cache.set(key, result, ttl)
    return result
  })
}

// Invalidate cache
export function invalidateCache(pattern: string): void {
  // Simple pattern matching for cache invalidation
  for (const key of cache.cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key)
    }
  }
}

// Run cleanup every 10 minutes
setInterval(() => {
  cache.cleanup()
}, 10 * 60 * 1000) 