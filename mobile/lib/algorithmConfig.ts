/**
 * Algorithm Configuration & Feature Flags
 * Control algorithm behavior and enable/disable for testing
 */

/**
 * Algorithm configuration
 */
export const ALGORITHM_CONFIG = {
  // Enable/disable feed algorithm
  FEED_ALGORITHM_ENABLED: true,
  
  // Enable/disable reels algorithm
  REELS_ALGORITHM_ENABLED: true,
  
  // Enable/disable caching
  CACHING_ENABLED: true,
  
  // Cache TTLs (in milliseconds)
  CACHE_TTL: {
    USER_VECTOR: 60 * 60 * 1000,        // 1 hour
    FEED: 15 * 60 * 1000,               // 15 minutes
    REEL_METRICS: 5 * 60 * 1000,        // 5 minutes
  },

  // Algorithm weights (default)
  EXPLORE_WEIGHTS: {
    similarity: 0.5,
    engagement: 0.3,
    freshness: 0.2,
  },

  FOLLOWING_WEIGHTS: {
    similarity: 0.4,
    engagement: 0.4,     // Higher engagement weight for following
    freshness: 0.2,
  },

  REELS_WEIGHTS: {
    completion: 0.5,     // Most important for reels
    watchTime: 0.3,
    engagement: 0.2,
  },

  // Time decay rates
  DECAY_RATES: {
    POST_LAMBDA: 0.1,    // Posts decay 10% per hour
    REEL_LAMBDA: 0.05,   // Reels decay 5% per hour (longer lifespan)
  },

  // Cold start threshold
  COLD_START_THRESHOLD: 5, // Use cold start algorithm for <5 interactions

  // Minimum batch size before sending watch events
  WATCH_EVENT_BATCH_SIZE: 8,

  // Watch event tracking interval (ms)
  WATCH_EVENT_INTERVAL: 250,
}

/**
 * Feature flags for A/B testing
 */
export const FEATURE_FLAGS = {
  // A/B test groups
  USE_ALGORITHM_V1: true,           // Use new ranking algorithm
  USE_COLD_START_FALLBACK: true,    // Use faith-based ranking for new users
  USE_BUCKET_RANKING: true,         // Use duration buckets for reels
  USE_LOOP_DETECTION: true,         // Boost frequently rewatched reels
  USE_DIVERSITY_ENFORCEMENT: true,  // Mix different creators in feed
}

/**
 * Debug mode - more verbose logging
 */
export const DEBUG_MODE = {
  LOG_RANKING_SCORES: false,        // Log score calculations
  LOG_VECTOR_UPDATES: false,        // Log vector changes
  LOG_CACHE_HITS: false,            // Log cache operations
  LOG_WATCH_EVENTS: false,          // Log watch time tracking
}

/**
 * Get configuration value
 */
export function getConfig(key: keyof typeof ALGORITHM_CONFIG) {
  return ALGORITHM_CONFIG[key]
}

/**
 * Get feature flag value
 */
export function isFeatureEnabled(flag: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[flag]
}

/**
 * Override configuration (for testing)
 */
export function setConfig(
  key: keyof typeof ALGORITHM_CONFIG,
  value: any,
): void {
  (ALGORITHM_CONFIG as any)[key] = value
  console.log(`[Config] Set ${key} = ${value}`)
}

/**
 * Override feature flag (for testing)
 */
export function setFeatureFlag(
  flag: keyof typeof FEATURE_FLAGS,
  enabled: boolean,
): void {
  (FEATURE_FLAGS as any)[flag] = enabled
  console.log(`[Config] Feature ${flag} = ${enabled ? 'enabled' : 'disabled'}`)
}

/**
 * Enable debug mode
 */
export function enableDebugMode(category?: keyof typeof DEBUG_MODE): void {
  if (category) {
    (DEBUG_MODE as any)[category] = true
    console.log(`[Debug] Enabled ${category}`)
  } else {
    Object.keys(DEBUG_MODE).forEach((key) => {
      (DEBUG_MODE as any)[key] = true
    })
    console.log('[Debug] Debug mode enabled for all categories')
  }
}

/**
 * Disable debug mode
 */
export function disableDebugMode(category?: keyof typeof DEBUG_MODE): void {
  if (category) {
    (DEBUG_MODE as any)[category] = false
    console.log(`[Debug] Disabled ${category}`)
  } else {
    Object.keys(DEBUG_MODE).forEach((key) => {
      (DEBUG_MODE as any)[key] = false
    })
    console.log('[Debug] Debug mode disabled')
  }
}

/**
 * Get current configuration state (for debugging)
 */
export function getConfigState() {
  return {
    algorithm: ALGORITHM_CONFIG,
    features: FEATURE_FLAGS,
    debug: DEBUG_MODE,
  }
}

/**
 * Usage in components:
 *
 * import { isFeatureEnabled, enableDebugMode } from '../lib/algorithmConfig'
 *
 * // In development
 * if (__DEV__) {
 *   enableDebugMode('LOG_RANKING_SCORES')
 * }
 *
 * // Conditional ranking
 * if (isFeatureEnabled('USE_ALGORITHM_V1')) {
 *   ranked = rankExploreFeeds(posts, userVector)
 * } else {
 *   ranked = posts // fallback to no ranking
 * }
 */
