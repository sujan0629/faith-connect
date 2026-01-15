import { View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'
import { useEffect } from 'react'
import { LinearGradient } from 'expo-linear-gradient'

const SkeletonPlaceholder = ({ width = 'w-24', height = 'h-4' }: { width?: string; height?: string }) => {
  const shimmer = useSharedValue(0)

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      true
    )
  }, [shimmer])

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmer.value,
      [0, 1],
      [-400, 400],
      Extrapolation.CLAMP
    )
    return { transform: [{ translateX }] }
  })

  return (
    <View className={`${width} ${height} rounded bg-gray-200 overflow-hidden relative`}>
      <Animated.View style={[animatedStyle, { width: 400, height: '100%' }]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.5)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: '100%', height: '100%' }}
        />
      </Animated.View>
    </View>
  )
}

export const MessageSkeleton = () => {
  return (
    <View className="flex-row items-center gap-3 px-4 py-4 border-b border-gray-100">
      {/* Avatar */}
      <View className="h-12 w-12 rounded-full bg-gray-200" />

      {/* Message Content */}
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          {/* Peer Name */}
          <SkeletonPlaceholder width="w-24" height="h-4" />
          {/* Timestamp */}
          <SkeletonPlaceholder width="w-12" height="h-3" />
        </View>

        {/* Last Message */}
        <SkeletonPlaceholder width="w-3/4" height="h-3" />

        {/* Unread indicator placeholder */}
        <View className="mt-1">
          <View className="h-2 w-2 rounded-full bg-gray-200" />
        </View>
      </View>
    </View>
  )
}

export const MessagesSkeleton = () => {
  return (
    <View>
      {[1, 2, 3].map((i) => (
        <MessageSkeleton key={i} />
      ))}
    </View>
  )
}