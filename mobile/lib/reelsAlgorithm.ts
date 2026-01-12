/**
 * Reels Algorithm Implementation
 * Watch-time-first ranking for short-form video content
 */

import { Post } from '../stores/feedStore'

/**
 * Reel engagement metrics
 */
export interface ReelMetrics {
  starts: number
  fullWatches: number
  avgWatchTime: number
  duration: number
  likes: number
  shares: number
  views: number
}

/**
 * Watch event for tracking reel engagement
 */
export interface WatchEvent {
  reelId: string
  userId: string
  watchTime: number // in seconds
  duration: number
  timestamp: Date
  completed: boolean
}

/**
 * Calculate completion rate
 * Formula: full_watches / starts
 * full_watches = users who watched >= 95% of video
 */
export function calculateCompletionRate(
  fullWatches: number,
  starts: number,
): number {
  if (starts === 0) return 0
  return fullWatches / starts
}

/**
 * Calculate average watch time ratio
 * Formula: avg_watch_time / video_length
 * Normalizes watch time across different video lengths
 */
export function calculateWatchTimeRatio(
  avgWatchTime: number,
  duration: number,
): number {
  if (duration === 0) return 0
  return avgWatchTime / duration
}

/**
 * Calculate engagement boost
 * Formula: (likes + shares) / (views + 1)
 * Shares weighted more heavily than likes
 */
export function calculateEngagementBoost(
  likes: number,
  shares: number,
  views: number,
): number {
  return (likes + shares * 2) / (views + 1)
}

/**
 * Rank reels using watch-time-first algorithm
 * Score = a·CompletionRate + b·AvgWatchTimeRatio + c·EngagementBoost
 * Then multiply by FaithMatch * Freshness
 * 
 * Uses REAL metrics from backend (avgWatchTime, completionRate, replayCount)
 * No more estimation - actual watch event data is tracked server-side
 * Only processes reels (type: 'reel', mediaType: 'reel')
 */
export function rankReels(
  reels: Post[],
  userFaith?: string,
  weights?: {
    completion: number
    watchTime: number
    engagement: number
  },
): Post[] {
  const w = weights || {
    completion: 0.5,
    watchTime: 0.3,
    engagement: 0.2,
  }

  // Filter to only reels (type: 'reel' with mediaType: 'reel')
  const actualReels = reels.filter((r) => r.type === 'reel' && r.mediaType === 'reel')

  const scoredReels = actualReels.map((reel) => {
    // Use REAL metrics from backend instead of guessing
    const completionRate = reel.completionRate || 0
    const avgWatchTime = reel.avgWatchTime || 0
    const duration = reel.videoDuration || 30
    
    // Calculate watch time ratio from real data
    const watchTimeRatio = duration > 0 ? avgWatchTime / duration : 0

    // Engagement boost from actual engagement data
    const engagementBoost = calculateEngagementBoost(
      reel.likes,
      reel.reposts, // reposts = shares
      reel.impressions || (reel.likes + reel.comments + reel.saves + 1),
    )

    const baseScore =
      w.completion * completionRate +
      w.watchTime * watchTimeRatio +
      w.engagement * engagementBoost

    // Apply faith match multiplier
    const faithMatch =
      reel.faith && userFaith && reel.faith.toLowerCase() === userFaith.toLowerCase()
        ? 1.0
        : reel.faith && reel.faith !== 'unknown'
          ? 0.6
          : 0.3

    // Apply freshness multiplier (decay faster than posts)
    const ageMs = new Date().getTime() - new Date(reel.createdAt).getTime()
    const ageHours = ageMs / (1000 * 60 * 60)
    const freshness = Math.exp(-0.05 * ageHours)

    // Apply replay boost if reel is being watched multiple times
    const replayBoost = 1 + (reel.replayCount || 0) * 0.1
    const score = (baseScore * faithMatch * freshness) * replayBoost

    return {
      reel,
      score,
      completionRate,
      watchTimeRatio,
      engagementBoost,
      faithMatch,
      freshness,
      replayBoost,
    }
  })

  return scoredReels.sort((a, b) => b.score - a.score).map((item) => item.reel)
}

/**
 * Track watch event for a reel
 * Batches events to reduce network calls
 */
export function createWatchEvent(
  reelId: string,
  userId: string,
  watchTime: number,
  duration: number,
): WatchEvent {
  return {
    reelId,
    userId,
    watchTime,
    duration,
    timestamp: new Date(),
    completed: watchTime / duration >= 0.95,
  }
}

/**
 * Calculate metrics from watch events
 */
export function calculateReelMetricsFromEvents(
  events: WatchEvent[],
): Partial<ReelMetrics> {
  if (events.length === 0) {
    return {
      starts: 0,
      fullWatches: 0,
      avgWatchTime: 0,
    }
  }

  const uniqueUsers = new Set(events.map((e) => e.userId))
  const fullWatches = events.filter((e) => e.completed).length
  const avgWatchTime = events.reduce((sum, e) => sum + e.watchTime, 0) / events.length

  return {
    starts: uniqueUsers.size,
    fullWatches,
    avgWatchTime,
  }
}

/**
 * Detect loops (repeated watches)
 * Same reel watched 3+ times = strong positive signal
 */
export function detectLoopSignal(
  events: WatchEvent[],
  reelId: string,
): boolean {
  const userWatches = new Map<string, number>()

  events
    .filter((e) => e.reelId === reelId)
    .forEach((event) => {
      const count = userWatches.get(event.userId) || 0
      userWatches.set(event.userId, count + 1)
    })

  // Check if any user watched 3+ times
  return Array.from(userWatches.values()).some((count) => count >= 3)
}

/**
 * Apply loop detection boost
 * 50% score increase if reel is being replayed frequently
 */
export function applyLoopDetectionBoost(score: number, loopDetected: boolean): number {
  return loopDetected ? score * 1.5 : score
}

/**
 * Bucket reels by duration for fair comparison
 * Short (0-15s), Medium (15-60s), Long (60-300s)
 */
export function getReelDurationBucket(duration: number): string {
  if (duration <= 15) return 'short'
  if (duration <= 60) return 'medium'
  return 'long'
}

/**
 * Rank reels within their duration bucket for fairer comparison
 * Prevents short reels from being buried by long reels or vice versa
 * Only processes actual reels (type: 'reel', mediaType: 'reel')
 */
export function rankReelsWithinBuckets(
  reels: Post[],
  userFaith?: string,
): Post[] {
  // Filter to only actual reels first
  const actualReels = reels.filter((r) => r.type === 'reel' && r.mediaType === 'reel')
  
  const buckets = {
    short: [] as Post[],
    medium: [] as Post[],
    long: [] as Post[],
  }

  // Distribute reels into buckets based on duration
  actualReels.forEach((reel) => {
    const bucket = getReelDurationBucket(reel.videoDuration || 30)
    buckets[bucket as keyof typeof buckets].push(reel)
  })

  // Rank within each bucket
  const rankedShort = rankReels(buckets.short, userFaith)
  const rankedMedium = rankReels(buckets.medium, userFaith)
  const rankedLong = rankReels(buckets.long, userFaith)

  // Interleave results: mix short, medium, and long reels
  // This prevents bias toward one format
  const result: Post[] = []
  const maxLength = Math.max(
    rankedShort.length,
    rankedMedium.length,
    rankedLong.length,
  )

  for (let i = 0; i < maxLength; i++) {
    if (i < rankedShort.length) result.push(rankedShort[i])
    if (i < rankedMedium.length) result.push(rankedMedium[i])
    if (i < rankedLong.length) result.push(rankedLong[i])
  }

  return result
}

/**
 * Calculate watch time ratio with exponential weighting
 * Videos watched multiple times get boosted
 */
export function calculateWeightedWatchRatio(
  avgWatchTime: number,
  duration: number,
  replayCount: number = 1,
): number {
  const baseRatio = avgWatchTime / duration
  // Exponential boost for replays: 1x for first watch, 1.5x for 2 watches, 2x for 3+
  const replayMultiplier = Math.min(2, 1 + (replayCount - 1) * 0.5)
  return baseRatio * replayMultiplier
}
