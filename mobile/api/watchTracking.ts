/**
 * Watch Event Tracking API
 * Sends watch time data to backend for reel engagement metrics
 */

import { api } from './axios'

export interface WatchEventPayload {
  reelId: string
  watchTime: number
  duration: number
  completed: boolean
  timestamp: string
}

export interface BatchWatchEventsPayload {
  events: WatchEventPayload[]
}

/**
 * Log a single watch event
 */
export async function logWatchEvent(event: WatchEventPayload): Promise<void> {
  try {
    await api.post('/posts/watch-event', event)
  } catch (error) {
    console.warn('[WatchTracking] Failed to log watch event:', error)
  }
}

/**
 * Batch log multiple watch events (more efficient)
 */
export async function batchLogWatchEvents(
  events: WatchEventPayload[],
): Promise<void> {
  if (events.length === 0) return

  try {
    await api.post('/posts/watch-events/batch', { events })
  } catch (error) {
    console.warn('[WatchTracking] Failed to batch log watch events:', error)
  }
}

/**
 * Log completion for a reel
 */
export async function logReelCompletion(reelId: string): Promise<void> {
  try {
    await api.post(`/posts/${reelId}/completion`)
  } catch (error) {
    console.warn('[WatchTracking] Failed to log completion:', error)
  }
}
