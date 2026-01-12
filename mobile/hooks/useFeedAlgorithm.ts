/**
 * Hook for using feed ranking algorithms
 * Manages user vector, ranking, and interaction tracking
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import { useFeedStore } from '../stores/feedStore'
import { useAuthStore } from '../stores/authStore'
import { useEngagementStore } from '../stores/engagementStore'

interface UseFeedAlgorithmOptions {
  autoRank?: boolean
  enableCaching?: boolean
}

export function useFeedAlgorithm(options: UseFeedAlgorithmOptions = {}) {
  const { autoRank = true, enableCaching = true } = options
  const user = useAuthStore((s) => s.user)
  const {
    userVector,
    initializeUserVector,
    loadCachedVector,
    recordInteraction,
    rankExplore,
    rankFollowing,
    rankReelsContent,
  } = useFeedStore()
  const { isLiked, isSaved } = useEngagementStore()
  const isInitialized = useRef(false)

  // Initialize user vector on mount
  useEffect(() => {
    if (!user?.id || isInitialized.current) return

    const initialize = async () => {
      isInitialized.current = true

      if (enableCaching) {
        await loadCachedVector(user.id)
      }

      if (!userVector) {
        await initializeUserVector(
          user.id,
          user.faith,
          user.contentFocus,
        )
      }
    }

    initialize().catch((error) => {
      console.error('[useFeedAlgorithm] Initialization error:', error)
    })
  }, [user?.id, enableCaching, initializeUserVector, loadCachedVector, userVector])

  // Track like interaction
  const trackLike = useCallback(
    async (postId: string, authorFaith?: string) => {
      if (!user?.id) return

      const isCurrentlyLiked = isLiked(postId)
      if (isCurrentlyLiked) {
        // Don't track if already liked (already tracked on initial like)
        return
      }

      await recordInteraction(user.id, postId, 'like', authorFaith)
    },
    [user?.id, isLiked, recordInteraction],
  )

  // Track save interaction
  const trackSave = useCallback(
    async (postId: string, authorFaith?: string) => {
      if (!user?.id) return

      const isCurrentlySaved = isSaved(postId)
      if (isCurrentlySaved) {
        return
      }

      await recordInteraction(user.id, postId, 'save', authorFaith)
    },
    [user?.id, isSaved, recordInteraction],
  )

  // Track view interaction
  const trackView = useCallback(
    async (postId: string, authorFaith?: string) => {
      if (!user?.id) return
      await recordInteraction(user.id, postId, 'view', authorFaith)
    },
    [user?.id, recordInteraction],
  )

  // Trigger ranking on-demand (call explicitly, don't auto-rank)
  const performRanking = useCallback(
    (type: 'explore' | 'following' | 'reels' = 'explore') => {
      if (!user?.id) return

      switch (type) {
        case 'explore':
          rankExplore(user.id)
          break
        case 'following':
          rankFollowing(user.id)
          break
        case 'reels':
          rankReelsContent(user.id)
          break
      }
    },
    [user?.id, rankExplore, rankFollowing, rankReelsContent],
  )

  // Don't auto-rank - only rank on demand when loading new content
  // This prevents reordering already-visible content while user is scrolling

  return {
    userVector,
    isInitialized: isInitialized.current,
    trackLike,
    trackSave,
    trackView,
    performRanking,
  }
}

/**
 * Hook for tracking reel watch events
 */

interface WatchEvent {
  reelId: string
  userId: string
  watchTime: number
  duration: number
  timestamp: Date
  completed: boolean
}

interface UseReelWatchTrackingOptions {
  reelId: string
  duration: number
  userId?: string
}

export function useReelWatchTracking({
  reelId,
  duration,
  userId,
}: UseReelWatchTrackingOptions) {
  const [watchEvents, setWatchEvents] = useState<WatchEvent[]>([])
  const [currentWatchTime, setCurrentWatchTime] = useState(0)

  const trackWatchTime = useCallback(
    (time: number) => {
      setCurrentWatchTime(time)

      // Create event every 250ms
      if (userId && Math.floor(time * 1000) % 250 === 0) {
        const event: WatchEvent = {
          reelId,
          userId,
          watchTime: time,
          duration,
          timestamp: new Date(),
          completed: time / duration >= 0.95,
        }
        setWatchEvents((prev) => [...prev, event])
      }
    },
    [reelId, duration, userId],
  )

  const getCompletionRate = useCallback(() => {
    return currentWatchTime / duration
  }, [currentWatchTime, duration])

  const isCompleted = useCallback(() => {
    return currentWatchTime / duration >= 0.95
  }, [currentWatchTime, duration])

  return {
    watchEvents,
    currentWatchTime,
    trackWatchTime,
    getCompletionRate,
    isCompleted,
  }
}
