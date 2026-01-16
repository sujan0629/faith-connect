import { useRef, useCallback } from 'react'
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native'
import { useUiStore } from '../stores/uiStore'

// Returns an `onScroll` handler you can attach to ScrollView/FlatList.
// Attach like: <FlatList onScroll={onScroll} scrollEventThrottle={16} ... />
export function useHideTabOnScroll(threshold = 5, topThreshold = 20) {
  const lastOffset = useRef(0)
  const setShow = useUiStore((s) => s.setShowTabBar)

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y
      const dy = y - lastOffset.current
      // If near the top, always show the tab bar
      if (y <= topThreshold) {
        setShow(true)
        lastOffset.current = y
        return
      }

      // ignore tiny jitter
      if (Math.abs(dy) < threshold) {
        lastOffset.current = y
        return
      }

      // Invert behavior: show tab bar when scrolling in the opposite direction.
      // Current behavior was opposite of expected, so flip the condition.
      setShow(dy < 0)

      lastOffset.current = y
    },
    [threshold, setShow],
  )

  return onScroll
}
