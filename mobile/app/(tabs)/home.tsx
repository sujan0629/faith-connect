import { useMemo, useState, useRef, useEffect } from 'react'
import { View, Text, ScrollView, Pressable, NativeScrollEvent, NativeSyntheticEvent, Animated, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons, Octicons } from '@expo/vector-icons'
import { PostCard } from '../../components/Feed/PostCard'
import { ReelCard } from '../../components/Reel/ReelCard'
import { HomeHeader } from '../../components/Headers/HomeHeader'
import { CreatePostModal } from '../../components/Feed/CreatePostModal'
import { useAuthStore } from '../../stores/authStore'
import { useFeedStore } from '../../stores/feedStore'
import { useFocusEffect } from 'expo-router'
import { toastConfig } from '../../components/ToastConfig'

const segments = ['Explore', 'Following'] as const

type Segment = (typeof segments)[number]

export default function HomeScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const [segment, setSegment] = useState<Segment>('Explore')
  const { explore, following, toggleLike, toggleSave } = useFeedStore()
  const user = useAuthStore((s) => s.user)
  const role = user?.role || 'worshiper'
  const [showCreatePostModal, setShowCreatePostModal] = useState(false)

  const data = useMemo(() => (segment === 'Explore' ? explore : following), [segment, explore, following])

  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [isAtTop, setIsAtTop] = useState(true)
  const [visibleReelId, setVisibleReelId] = useState<string | null>(null)
  const [visiblePostId, setVisiblePostId] = useState<string | null>(null)
  const [reelPositions, setReelPositions] = useState<Record<string, { y: number; height: number }>>({})
  const [postPositions, setPostPositions] = useState<Record<string, { y: number; height: number; type: string }>>({})
  const [isScreenFocused, setIsScreenFocused] = useState(true)
  const scrollY = useRef(0)
  const headerTranslateY = useRef(new Animated.Value(0)).current
  const headerOpacity = useRef(new Animated.Value(1)).current

  useFocusEffect(
    useRef(() => {
      setIsScreenFocused(true)
      return () => {
        setIsScreenFocused(false)
      }
    }).current
  )

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerTranslateY, {
        toValue: isHeaderVisible ? 0 : -60,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacity, {
        toValue: isHeaderVisible ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start()
  }, [isHeaderVisible])

  useEffect(() => {
    if (params.from === 'onboarding') {
      Toast.show({ type: 'success', text1: 'Profile updated', text2: 'Welcome to FaithConnect!' })
    }
  }, [params.from])

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y
    const screenHeight = Dimensions.get('window').height
    const centerY = currentScrollY + screenHeight / 2
    
    setIsAtTop(currentScrollY < 50)
    
    if (currentScrollY < 50) {
      setIsHeaderVisible(true)
    } else if (currentScrollY > scrollY.current) {
      setIsHeaderVisible(false)
    } else if (currentScrollY < scrollY.current) {
      setIsHeaderVisible(true)
    }
    
    scrollY.current = currentScrollY
    
    // Find which reel and post are closest to center of screen
    let closestReel: string | null = null
    let closestPost: string | null = null
    let closestReelDistance = Infinity
    let closestPostDistance = Infinity
    
    Object.entries(reelPositions).forEach(([reelId, position]) => {
      const reelCenter = position.y + position.height / 2
      const distance = Math.abs(centerY - reelCenter)
      
      if (distance < closestReelDistance) {
        closestReelDistance = distance
        closestReel = reelId
      }
    })
    
    Object.entries(postPositions).forEach(([postId, position]) => {
      const postCenter = position.y + position.height / 2
      const distance = Math.abs(centerY - postCenter)
      
      if (distance < closestPostDistance) {
        closestPostDistance = distance
        closestPost = postId
      }
    })
    
    // Only show reel audio if no post with video is visible
    if (closestReel && closestReelDistance < closestPostDistance) {
      setVisibleReelId(closestReel)
      setVisiblePostId(null)
    } else if (closestPost) {
      setVisiblePostId(closestPost)
      setVisibleReelId(null)
    }
  }

  const handleReelLayout = (reelId: string, event: any) => {
    const { y, height } = event.nativeEvent.layout
    setReelPositions(prev => ({
      ...prev,
      [reelId]: { y, height }
    }))
  }

  const handlePostLayout = (postId: string, event: any) => {
    const { y, height } = event.nativeEvent.layout
    setPostPositions(prev => ({
      ...prev,
      [postId]: { y, height, type: 'post' }
    }))
  }

  const handlePost = (content: string, media?: string | null) => {
    Toast.show({ type: 'success', text1: 'Post published!' })
    setShowCreatePostModal(false)
  }

  const handlePublish = () => {
    if (role === 'leader') {
      router.push('/(tabs)/create')
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="relative flex-1" style={{ overflow: 'hidden' }}>
        <Animated.View 
          className="absolute top-0 left-0 right-0 z-50 bg-white"
          style={{
            transform: [{ translateY: headerTranslateY }],
            opacity: headerOpacity,
          }}
        >
          <HomeHeader segment={segment} onSegmentChange={setSegment} isAtTop={isAtTop} />
        </Animated.View>
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ paddingBottom: 32, paddingTop: 120 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {role === 'leader' ? (
           <View className="mx-4 mb-6 mt-3 rounded-2xl bg-gray-50 p-4">
  <Text className="text-base font-medium text-gray-900">
    Post your first update today
  </Text>
  <Text className="text-sm text-gray-600 mt-1 mb-3">
    Share your thoughts by posting your first update
  </Text>

  <Pressable
    onPress={() => setShowCreatePostModal(true)}
    className="self-start rounded-xl bg-blue-500 px-4 py-2.5 flex-row items-center gap-2"
  >
    <Octicons name="sparkle-fill" size={16} color="white" />
    <Text className="text-sm font-semibold text-white">Create post</Text>
  </Pressable>
</View>
          ) : null}
      {data.map((item) => (
        item.type === 'reel' ? (
          <View key={item.id} onLayout={(e) => handleReelLayout(item.id, e)}>
            <ReelCard item={item} onLike={toggleLike} onSave={toggleSave} isVisible={visibleReelId === item.id} isScreenFocused={isScreenFocused} />
          </View>
        ) : (
          <View key={item.id} onLayout={(e) => handlePostLayout(item.id, e)}>
            <PostCard item={item} onLike={toggleLike} onSave={toggleSave} isVisible={visiblePostId === item.id && item.mediaType === 'video'} />
          </View>
        )
      ))}

      {data.length === 0 ? (
        <View className="mx-4 mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <Text className="text-sm text-gray-600">No posts here yet. Follow leaders to see updates.</Text>
        </View>
      ) : null}
        </ScrollView>
      </View>

      <CreatePostModal
        visible={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        onPost={handlePost}
      />
      <Toast config={toastConfig} />
    </SafeAreaView>
  )
}
