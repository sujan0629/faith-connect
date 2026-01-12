/**
 * Caching Utilities for Feed & Reels Algorithms
 * Handles local caching with TTL to optimize performance
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { UserVector } from './feedAlgorithm'

const CACHE_PREFIX = '@faithconnect:'

/**
 * Cache entry with TTL
 */
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // in milliseconds
}

/**
 * Get cache key for user vector
 */
function getVectorCacheKey(userId: string): string {
  return `${CACHE_PREFIX}user:${userId}:vector`
}

/**
 * Get cache key for feed
 */
function getFeedCacheKey(userId: string): string {
  return `${CACHE_PREFIX}user:${userId}:feed`
}

/**
 * Get cache key for reel metrics
 */
function getReelMetricsCacheKey(reelId: string): string {
  return `${CACHE_PREFIX}reel:${reelId}:metrics`
}

/**
 * Check if cache entry is still valid
 */
function isCacheValid<T>(entry: CacheEntry<T>): boolean {
  const now = Date.now()
  return now - entry.timestamp < entry.ttl
}

/**
 * Cache user vector locally with 1 hour TTL
 */
export async function cacheUserVector(
  userId: string,
  vector: UserVector,
): Promise<void> {
  try {
    const entry: CacheEntry<UserVector> = {
      data: vector,
      timestamp: Date.now(),
      ttl: 60 * 60 * 1000, // 1 hour
    }
    await AsyncStorage.setItem(
      getVectorCacheKey(userId),
      JSON.stringify(entry),
    )
  } catch (error) {
    console.warn('[Cache] Failed to cache user vector:', error)
  }
}

/**
 * Get cached user vector
 */
export async function getCachedUserVector(
  userId: string,
): Promise<UserVector | null> {
  try {
    const cached = await AsyncStorage.getItem(getVectorCacheKey(userId))
    if (!cached) return null

    const entry: CacheEntry<UserVector> = JSON.parse(cached)
    if (!isCacheValid(entry)) {
      // Cache expired, remove it
      await AsyncStorage.removeItem(getVectorCacheKey(userId))
      return null
    }

    return entry.data
  } catch (error) {
    console.warn('[Cache] Failed to retrieve user vector:', error)
    return null
  }
}

/**
 * Invalidate user vector cache
 */
export async function invalidateUserVectorCache(userId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(getVectorCacheKey(userId))
  } catch (error) {
    console.warn('[Cache] Failed to invalidate vector cache:', error)
  }
}

/**
 * Cache precomputed feed with 15 minute TTL
 */
export async function cacheFeed(
  userId: string,
  postIds: string[],
): Promise<void> {
  try {
    const entry: CacheEntry<string[]> = {
      data: postIds,
      timestamp: Date.now(),
      ttl: 15 * 60 * 1000, // 15 minutes
    }
    await AsyncStorage.setItem(getFeedCacheKey(userId), JSON.stringify(entry))
  } catch (error) {
    console.warn('[Cache] Failed to cache feed:', error)
  }
}

/**
 * Get cached feed
 */
export async function getCachedFeed(userId: string): Promise<string[] | null> {
  try {
    const cached = await AsyncStorage.getItem(getFeedCacheKey(userId))
    if (!cached) return null

    const entry: CacheEntry<string[]> = JSON.parse(cached)
    if (!isCacheValid(entry)) {
      await AsyncStorage.removeItem(getFeedCacheKey(userId))
      return null
    }

    return entry.data
  } catch (error) {
    console.warn('[Cache] Failed to retrieve cached feed:', error)
    return null
  }
}

/**
 * Invalidate feed cache
 */
export async function invalidateFeedCache(userId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(getFeedCacheKey(userId))
  } catch (error) {
    console.warn('[Cache] Failed to invalidate feed cache:', error)
  }
}

/**
 * Cache reel engagement metrics with 5 minute TTL
 */
export async function cacheReelMetrics(
  reelId: string,
  metrics: Record<string, any>,
): Promise<void> {
  try {
    const entry: CacheEntry<Record<string, any>> = {
      data: metrics,
      timestamp: Date.now(),
      ttl: 5 * 60 * 1000, // 5 minutes
    }
    await AsyncStorage.setItem(
      getReelMetricsCacheKey(reelId),
      JSON.stringify(entry),
    )
  } catch (error) {
    console.warn('[Cache] Failed to cache reel metrics:', error)
  }
}

/**
 * Get cached reel metrics
 */
export async function getCachedReelMetrics(
  reelId: string,
): Promise<Record<string, any> | null> {
  try {
    const cached = await AsyncStorage.getItem(getReelMetricsCacheKey(reelId))
    if (!cached) return null

    const entry: CacheEntry<Record<string, any>> = JSON.parse(cached)
    if (!isCacheValid(entry)) {
      await AsyncStorage.removeItem(getReelMetricsCacheKey(reelId))
      return null
    }

    return entry.data
  } catch (error) {
    console.warn('[Cache] Failed to retrieve reel metrics:', error)
    return null
  }
}

/**
 * Clear all cache entries (useful for logout)
 */
export async function clearAllCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys()
    const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX))
    await AsyncStorage.multiRemove(cacheKeys)
  } catch (error) {
    console.warn('[Cache] Failed to clear cache:', error)
  }
}

/**
 * Get cache stats for debugging
 */
export async function getCacheStats(): Promise<{
  totalEntries: number
  cacheSize: string
}> {
  try {
    const keys = await AsyncStorage.getAllKeys()
    const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX))
    let totalSize = 0

    for (const key of cacheKeys) {
      const value = await AsyncStorage.getItem(key)
      if (value) {
        totalSize += value.length
      }
    }

    return {
      totalEntries: cacheKeys.length,
      cacheSize: `${(totalSize / 1024).toFixed(2)} KB`,
    }
  } catch (error) {
    console.warn('[Cache] Failed to get cache stats:', error)
    return { totalEntries: 0, cacheSize: '0 KB' }
  }
}

/**
 * Offline Support - Cache API responses for offline access
 */

const OFFLINE_CACHE_PREFIX = '@faithconnect:offline:'
const OFFLINE_CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Cache posts/reels for offline viewing
 */
export async function cacheFeedForOffline(
  key: string,
  data: any
): Promise<void> {
  try {
    const cacheKey = `${OFFLINE_CACHE_PREFIX}${key}`
    const entry: CacheEntry<any> = {
      data,
      timestamp: Date.now(),
      ttl: OFFLINE_CACHE_EXPIRY,
    }
    await AsyncStorage.setItem(cacheKey, JSON.stringify(entry))
  } catch (error) {
    console.warn('[Offline Cache] Failed to cache feed:', error)
  }
}

/**
 * Get cached feed data for offline access
 */
export async function getCachedFeedForOffline(key: string): Promise<any | null> {
  try {
    const cacheKey = `${OFFLINE_CACHE_PREFIX}${key}`
    const cached = await AsyncStorage.getItem(cacheKey)

    if (!cached) return null

    const entry: CacheEntry<any> = JSON.parse(cached)
    if (isCacheValid(entry)) {
      return entry.data
    }

    // Remove expired cache
    await AsyncStorage.removeItem(cacheKey)
    return null
  } catch (error) {
    console.warn('[Offline Cache] Failed to get cached feed:', error)
    return null
  }
}

/**
 * Clear offline cache
 */
export async function clearOfflineCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys()
    const offlineKeys = keys.filter((key) =>
      key.startsWith(OFFLINE_CACHE_PREFIX)
    )
    if (offlineKeys.length > 0) {
      await AsyncStorage.multiRemove(offlineKeys)
    }
  } catch (error) {
    console.warn('[Offline Cache] Failed to clear offline cache:', error)
  }
}
