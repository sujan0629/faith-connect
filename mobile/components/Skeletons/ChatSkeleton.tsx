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

export const ChatSkeleton = () => {
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24 }} className="flex-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} className={`mb-4 ${i % 2 === 0 ? 'items-end' : 'items-start'}`}>
          <View className={`max-w-[70%] ${i % 2 === 0 ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
            {i % 2 !== 0 && <View className="h-8 w-8 rounded-full bg-gray-200" />}
            <View className={`rounded-2xl px-4 py-2 ${i % 2 === 0 ? 'bg-gray-100' : 'bg-gray-100'}`}>
              <SkeletonPlaceholder width={i % 3 === 0 ? 'w-32' : i % 3 === 1 ? 'w-48' : 'w-24'} height="h-4" />
              <View className="mt-1">
                <SkeletonPlaceholder width="w-16" height="h-3" />
              </View>
            </View>
            {i % 2 === 0 && <View className="h-8 w-8 rounded-full bg-gray-200" />}
          </View>
        </View>
      ))}
    </ScrollView>
  )
}