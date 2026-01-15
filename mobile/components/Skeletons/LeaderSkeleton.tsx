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

export const LeaderSkeleton = () => {
  return (
    <View className="mb-4 rounded-2xl bg-white p-4">
      {/* Header with avatar and follow button */}
      <View className="mb-3 flex-row items-start justify-between">
        <View className="flex-row items-center gap-3">
          {/* Avatar */}
          <View className="h-16 w-16 rounded-full bg-gray-200" />
          <View className="flex-1">
            {/* Name */}
            <SkeletonPlaceholder width="w-32" height="h-4" />
            {/* Faith */}
            <View className="mt-1">
              <SkeletonPlaceholder width="w-20" height="h-3" />
            </View>
          </View>
        </View>
      
      </View>

      {/* Bio */}
      <View className="mb-3 gap-1">
        <SkeletonPlaceholder width="w-full" height="h-3" />
        <SkeletonPlaceholder width="w-4/5" height="h-3" />
      </View>

      {/* Stats */}
      <View className="flex-row gap-4">
        <SkeletonPlaceholder width="w-12" height="h-3" />
        <SkeletonPlaceholder width="w-12" height="h-3" />
        <SkeletonPlaceholder width="w-12" height="h-3" />
      </View>
    </View>
  )
}

export const LeadersSkeleton = () => {
  return (
    <View>
      {[1, 2, 3, 4, 5].map((i) => (
        <LeaderSkeleton key={i} />
      ))}
    </View>
  )
}