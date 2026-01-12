import { useEffect, useRef } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import OfflineSyncService from '../lib/offlineSync'
import { useOfflineStore } from '../stores/offlineStore'

export const useNetworkSync = () => {
  const { setOfflineStatus, isOffline, queue } = useOfflineStore()
  const appStateRef = useRef<AppStateStatus>('active')
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
      } else {
        // Clear interval when app goes to background
        if (syncTimeoutRef.current) {
          clearInterval(syncTimeoutRef.current)
        }
      }
    })

    // Initial check
    checkNetwork()
    syncTimeoutRef.current = setInterval(checkNetwork, 30000)

    return () => {
      subscription.remove()
      if (syncTimeoutRef.current) {
        clearInterval(syncTimeoutRef.current)
      }
    }
  }, [isOffline, queue.length])

  return { isOffline }
}
