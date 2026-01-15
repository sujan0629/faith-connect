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
      withTiming(1, { duration: 1400 }),
      -1,
      true
    )
  }, [shimmer])

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmer.value, [0, 1], [-300, 300], Extrapolation.CLAMP)
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

export const ProfileSkeleton = () => {
  return (
    <View className="flex-1 bg-white">
      {/* Header (matches ProfileHeader) */}
      <View className="bg-white px-4 py-6">
        <View className="items-center">
          <View className="h-24 w-24 rounded-full bg-gray-200" />
          <View className="items-center mt-3">
            <View className="flex-row items-center gap-1.5">
              <SkeletonPlaceholder width="w-36" height="h-6" />
              <View className="h-5 w-5 rounded bg-gray-200" />
            </View>
            <View className="mt-2 flex-row items-center gap-2 justify-center">
              <SkeletonPlaceholder width="w-24" height="h-4" />
              <SkeletonPlaceholder width="w-20" height="h-4" />
            </View>
          </View>

          {/* Stats */}
          <View className="flex-row items-center justify-center mt-6 mb-3 w-full">
            <View className="flex-1 items-center pr-2">
              <SkeletonPlaceholder width="w-12" height="h-6" />
              <View className="mt-1">
              <SkeletonPlaceholder width="w-16" height="h-3" />
              </View>
            </View>
            <View className="flex-1 items-center px-2">
              <SkeletonPlaceholder width="w-12" height="h-6" />
              <View className="mt-1">
              <SkeletonPlaceholder width="w-16" height="h-3" />
              </View>
            </View>
            <View className="flex-1 items-center pl-2">
              <SkeletonPlaceholder width="w-12" height="h-6" />
              <View className="mt-1">
              <SkeletonPlaceholder width="w-16" height="h-3" />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Actions (matches ProfileActions) */}
      <View className="bg-white px-4 pb-8">
        <View className="flex-row items-center justify-center">
          <View className="flex-1 items-center rounded-lg mr-2 bg-gray-100">
            <SkeletonPlaceholder width="w-full" height="h-8" />
          </View>
          <View className="flex-1 items-center rounded-lg mx-2 bg-gray-100">
            <SkeletonPlaceholder width="w-full" height="h-8" />
          </View>
          <View className="flex-1 items-center rounded-lg ml-2 bg-gray-100">
            <SkeletonPlaceholder width="w-full" height="h-8" />
          </View>
        </View>
      </View>

      {/* Tabs (matches ProfileTabs) */}
      <View className="bg-white border-b border-gray-100">
        <View className="flex-row">
          {['Posts','Reels','Saved','Repost','Replies'].map((t, i) => (
            <View key={t} className="flex-1 py-3 border-b-2 border-transparent items-center">
              <SkeletonPlaceholder width="w-20" height="h-4" />
            </View>
          ))}
        </View>
      </View>

      {/* Grid placeholder - show 3 taller items */}
      <View className="px-1 mt-3 flex-row flex-wrap">
        {[1,2,3].map((i) => (
          <View key={i} className="w-1/3 p-1">
            <View className="h-60 rounded-xl bg-gray-200" />
          </View>
        ))}
      </View>
    </View>
  )
}

export default ProfileSkeleton
