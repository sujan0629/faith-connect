import React, { useRef } from 'react'
import { Pressable, PressableProps } from 'react-native'

interface DebouncedPressableProps extends PressableProps {
  onPress?: () => void | Promise<void>
  debounceDelay?: number
}

/**
 * Drop-in replacement for Pressable that automatically debounces onPress
 * Prevents double-tap issues without needing to modify every navigation handler
 */
export const DebouncedPressable: React.FC<DebouncedPressableProps> = ({
  onPress,
  debounceDelay = 300,
  disabled = false,
  ...props
}) => {
  const lastPressRef = useRef<number>(0)
  const isProcessingRef = useRef(false)

  const handlePress = async () => {
    const now = Date.now()
    
    // Debounce: ignore if pressed within debounceDelay
    if (now - lastPressRef.current < debounceDelay) {
      return
    }
    
    // Prevent concurrent executions
    if (isProcessingRef.current) {
      return
    }

    lastPressRef.current = now

    if (onPress) {
      try {
        isProcessingRef.current = true
        const result = onPress()
        
        // Handle async handlers
        if (result instanceof Promise) {
          await result
        }
      } finally {
        isProcessingRef.current = false
      }
    }
  }

  return (
    <Pressable
      {...props}
      onPress={disabled ? undefined : handlePress}
      disabled={disabled || isProcessingRef.current}
    />
  )
}
