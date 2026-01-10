import { View, Text, Pressable, Image, Animated, Easing } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../stores/authStore'

const segments = ['Explore', 'Following'] as const
type Segment = (typeof segments)[number]

interface HomeHeaderProps {
  segment: Segment
  onSegmentChange: (segment: Segment) => void
  isAtTop: boolean
}

export const HomeHeader = ({ segment, onSegmentChange, isAtTop }: HomeHeaderProps) => {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const [isExpanded, setIsExpanded] = useState(false)
  const toggleOpacity = useRef(new Animated.Value(0)).current

  const shouldShow = isExpanded || isAtTop

  useEffect(() => {
    Animated.timing(toggleOpacity, {
      toValue: shouldShow ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [shouldShow])

  return (
    <View className="bg-white">
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable className="h-9 w-9 items-center justify-center">
          <Ionicons name="filter" size={24} color="#111111" />
        </Pressable>
        <Pressable 
          className="flex-row items-center gap-1"
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <Text className="text-[20px] font-bold text-[#111111]">
            FaithConnect
          </Text>
          <Ionicons 
            name={shouldShow ? "chevron-up" : "chevron-down"} 
            size={15} 
            color="#111111" 
          />
        </Pressable>
        <Pressable 
          className="h-9 w-9 items-center justify-center"
          onPress={() => user?.id && router.push(`/profile/${user.id}` as any)}
        >
          <Image 
            source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cmFuZG9tJTIwcGVvcGxlfGVufDB8fDB8fHww' }} 
            className="h-9 w-9 rounded-full bg-gray-200" 
          />
        </Pressable>
      </View>
      
      {shouldShow && (
        <Animated.View style={{ opacity: toggleOpacity }}>
          <View className="mb-4 mt-4 flex-row gap-0 bg-gray-100 mx-4 rounded-full p-1">
            {segments.map((item) => (
              <Pressable
                key={item}
                onPress={() => onSegmentChange(item)}
                className={`flex-1 rounded-full px-6 py-2.5 ${segment === item ? 'bg-[#111]' : 'bg-transparent'}`}
              >
                <Text className={`text-center text-sm font-semibold ${segment === item ? 'text-white' : 'text-gray-600'}`}>
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      )}
    </View>
  )
}
