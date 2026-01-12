import { useCallback, useEffect, useRef } from 'react'
import { postsApi } from '../api/posts'

/**
 * Hook for tracking post impressions and watch events
 * Batches requests for performance
 */
export function usePostMetrics() {
  const impressionQueueRef = useRef<Array<{ postId: string; userId?: string }>>([])
  const watchQueueRef = useRef<Array<{ postId: string; watchTime: number; duration: number }>>([])

  /**
   * Track impression (post view)
   */
  const trackImpression = useCallback((postId: string, userId?: string) => {
    impressionQueueRef.current.push({ postId, userId })

    // Batch impressions - send every 5 or after 1 second
    if (impressionQueueRef.current.length >= 5) {
      flushImpressions()
    }
  }, [])

  /**
   * Track watch event (reel/video view)
   */
  const trackWatch = useCallback((postId: string, watchTime: number, duration: number) => {
    watchQueueRef.current.push({ postId, watchTime, duration })

    // Send watch events individually or batch them
    if (watchQueueRef.current.length >= 3) {
      flushWatchEvents()
    }
  }, [])

  /**
   * Flush impression queue to backend
   */
  const flushImpressions = useCallback(async () => {
    if (impressionQueueRef.current.length === 0) return

    try {
      const toSend = [...impressionQueueRef.current]
      impressionQueueRef.current = []

      await postsApi.batchTrackImpressions(toSend)
    } catch (error) {
      console.error('Failed to track impressions:', error)
      // Re-queue on failure
      impressionQueueRef.current.push(...impressionQueueRef.current)
    }
  }, [])

  /**
   * Flush watch events queue to backend
   */
  const flushWatchEvents = useCallback(async () => {
    if (watchQueueRef.current.length === 0) return

    try {
      const toSend = [...watchQueueRef.current]
      watchQueueRef.current = []

      // Track each watch event
      for (const watch of toSend) {
        await postsApi.trackWatch(watch.postId, watch.watchTime, watch.duration)
      }
    } catch (error) {
      console.error('Failed to track watch events:', error)
      // Re-queue on failure
      watchQueueRef.current.push(...watchQueueRef.current)
    }
  }, [])

  /**
   * Setup periodic flush (every 5 seconds for impressions, 10 for watch)
   */
  useEffect(() => {
    const impressionInterval = setInterval(() => {
      flushImpressions()
    }, 5000)

    const watchInterval = setInterval(() => {
      flushWatchEvents()
    }, 10000)

    return () => {
      clearInterval(impressionInterval)
      clearInterval(watchInterval)
    }
  }, [flushImpressions, flushWatchEvents])

  return {
    trackImpression,
    trackWatch,
    flushImpressions,
    flushWatchEvents,
  }
}
