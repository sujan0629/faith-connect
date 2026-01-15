import { useCallback, useRef } from 'react'
import { useRouter } from 'expo-router'

/**
 * Debounce hook to prevent multiple rapid calls to a function
 * Perfect for preventing double-tap issues on buttons
 */
export const useDebounce = (callback: (...args: any[]) => any, delay: number = 300) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isCallingRef = useRef(false)

  return useCallback(
    (...args: any[]) => {
      // Prevent multiple rapid calls
      if (isCallingRef.current) return

      isCallingRef.current = true

      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Execute callback immediately
      callback(...args)

      // Re-enable after delay
      timeoutRef.current = setTimeout(() => {
        isCallingRef.current = false
      }, delay)
    },
    [callback, delay]
  )
}

/**
 * Hook to prevent rapid repeated navigation
 */
export const useDebouncedNavigation = (onNavigate: () => void, delay: number = 300) => {
  const lastNavigateRef = useRef<number>(0)

  return useCallback(() => {
    const now = Date.now()
    if (now - lastNavigateRef.current < delay) {
      return // Ignore if called too soon
    }
    lastNavigateRef.current = now
    onNavigate()
  }, [onNavigate, delay])
}

/**
 * Drop-in replacement for router that debounces navigation calls
 * Prevents double-tap navigation issues
 */
export const useDebouncedRouter = (delay: number = 300) => {
  const router = useRouter()
  const lastActionRef = useRef<number>(0)

  const canNavigate = useCallback(() => {
    const now = Date.now()
    if (now - lastActionRef.current < delay) {
      return false
    }
    lastActionRef.current = now
    return true
  }, [delay])

  return {
    push: (href: any) => {
      if (canNavigate()) router.push(href)
    },
    replace: (href: any) => {
      if (canNavigate()) router.replace(href)
    },
    back: () => {
      if (canNavigate()) router.back()
    },
    dismiss: () => router.dismiss(),
    canDismiss: router.canDismiss,
    setParams: router.setParams,
  } as any
}
