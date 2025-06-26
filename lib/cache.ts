// Simple in-memory cache for API responses
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  set(key: string, data: any, ttl: number = 5 * 60 * 1000) {
    // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get(key: string) {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear() {
    this.cache.clear()
  }

  delete(key: string) {
    this.cache.delete(key)
  }
}

export const cache = new SimpleCache()

// Cache keys
export const CACHE_KEYS = {
  PRODUCTS: "products",
  PRODUCT: (id: string) => `product:${id}`,
  DASHBOARD_STATS: "dashboard:stats",
  RECENT_ORDERS: "dashboard:recent-orders",
  POPULAR_PRODUCTS: "dashboard:popular-products",
  CUSTOMERS: "customers",
  ORDERS: "orders",
  GOOGLE_SHEETS: "google-sheets",
} as const
