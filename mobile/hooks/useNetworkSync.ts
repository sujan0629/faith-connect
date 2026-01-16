import { useEffect, useRef } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import OfflineSyncService from '../lib/offlineSync'
import { useOfflineStore } from '../stores/offlineStore'
import { api } from '../api/axios'

export const useNetworkSync = () => {
  const { setOfflineStatus, isOffline, queue } = useOfflineStore()
  const appStateRef = useRef<AppStateStatus>('active')
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Check network status
    const checkNetwork = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)
        
        try {
          // Try to reach any stable endpoint
          const response = await fetch('https://www.google.com', {
            method: 'HEAD',
            signal: controller.signal,
          })
          clearTimeout(timeoutId)
          
          // If we got a response, we're online
          setOfflineStatus(false)

          // If we were offline and now online, sync queued actions
          if (isOffline && queue.length > 0) {
            await OfflineSyncService.syncQueuedActions()
          }
        } catch (fetchError) {
          clearTimeout(timeoutId)
          throw fetchError
        }
      } catch (error) {
        // Only set offline if network is definitely down
        setOfflineStatus(true)
      }
    }

    // Handle app state changes
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      appStateRef.current = nextAppState

      if (nextAppState === 'active') {
        checkNetwork()
        
        // Also check every 30 seconds while app is active
        syncTimeoutRef.current = setInterval(checkNetwork, 30000)
        // Start health ping every 2 minutes while app is active (more aggressive to prevent cold start)
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current)
        }
        pingIntervalRef.current = setInterval(() => {
          try {
            // Lightweight ping to keep backend awake on Render free tier (which sleeps after 15 mins)
            api.get('/health', { timeout: 5000 }).catch(() => {})
          } catch (e) {
            // ignore
          }
        }, 2 * 60 * 1000) // 2 minutes instead of 4
      } else {
        // IMPORTANT: Continue pinging even in background to prevent cold start
        // Render free tier sleeps after 15 mins - we need constant heartbeat
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current)
        }
        pingIntervalRef.current = setInterval(() => {
          try {
            // Background health ping - critical for Render free tier
            api.get('/health', { timeout: 5000 }).catch(() => {})
          } catch (e) {
            // ignore
          }
        }, 2 * 60 * 1000) // 2 minutes - keep the app warm even in background
      }
    })

    // Initial check
    checkNetwork()
    syncTimeoutRef.current = setInterval(checkNetwork, 30000)
    // Start health ping immediately and then every 2 minutes (prevents Render cold start)
    pingIntervalRef.current = setInterval(() => {
      try {
        api.get('/health', { timeout: 5000 }).catch(() => {})
      } catch (e) {
        // ignore
      }
    }, 2 * 60 * 1000)

    return () => {
      subscription.remove()
      if (syncTimeoutRef.current) {
        clearInterval(syncTimeoutRef.current)
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
      }
    }
  }, [isOffline, queue.length])

  return { isOffline }
}
