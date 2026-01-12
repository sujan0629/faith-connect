import { View, ScrollView } from 'react-native'
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

export const HomeSkeleton = () => {
  return (
    <View className="flex-1 bg-white">
      {/* Header Skeleton */}
      <View className="bg-white">
        <View className="flex-row items-center justify-between px-4 py-3">
          {/* Filter icon */}
          <SkeletonPlaceholder width="w-6" height="h-6" />
          
          {/* Title and chevron */}
          <View className="flex-row items-center gap-1">
            <SkeletonPlaceholder width="w-24" height="h-6" />
            <SkeletonPlaceholder width="w-4" height="h-4" />
          </View>
          
          {/* Avatar */}
          <View className="h-9 w-9 rounded-full bg-gray-200" />
        </View>

        {/* Segment toggle */}
        <View className="mb-4 mt-4 mx-4 rounded-full bg-gray-100 p-3 flex-row gap-0">
          <View className="flex-1 rounded-full px-6 py-4 bg-gray-200" />
          <View className="flex-1 rounded-full px-6 py-4 bg-gray-100" />
        </View>
      </View>

      {/* Posts Skeleton */}
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} className="border-b border-[#f0f0f0] bg-white px-5 pb-5 pt-4">
            {/* Header - Avatar, Author name, Timestamp, Menu */}
            <View className="mb-2.5 flex-row items-center justify-between">
              <View className="flex-1 flex-row items-center gap-2.5">
                {/* Avatar */}
                <View className="h-8 w-8 rounded-full bg-gray-200" />
                <View className="flex-1">
                  <SkeletonPlaceholder width="w-24" height="h-4" />
                </View>
              </View>
              {/* Timestamp and menu */}
              <View className="flex-row items-center gap-2">
                <SkeletonPlaceholder width="w-12" height="h-3" />
                <SkeletonPlaceholder width="w-3" height="h-3" />
              </View>
            </View>

            {/* Post Text */}
            <View className="mb-3 gap-1">
              <SkeletonPlaceholder width="w-full" height="h-3" />
              <SkeletonPlaceholder width="w-4/5" height="h-3" />
            </View>

            {/* Media placeholder (image or video) */}
            <View className="mb-3 h-[250px] w-full rounded-xl bg-gray-200" />

            {/* Action Bar */}
            <View className="flex-row items-center justify-between">
              <SkeletonPlaceholder width="w-16" height="h-5" />
              <SkeletonPlaceholder width="w-16" height="h-5" />
              <SkeletonPlaceholder width="w-16" height="h-5" />
              <View className="h-5 w-12 rounded-full bg-gray-200" />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}
