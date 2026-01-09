import { useMemo, useState, useRef, useEffect } from 'react'
import { View, Text, ScrollView, Pressable, TextInput, NativeScrollEvent, NativeSyntheticEvent, Animated, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { PostCard } from '../../components/Feed/PostCard'
import { ReelCard } from '../../components/Reel/ReelCard'
import { HomeHeader } from '../../components/Headers/HomeHeader'
import { SolidButton } from '../../components/Buttons/SolidButton'
import { useAuthStore } from '../../stores/authStore'
import { useFeedStore } from '../../stores/feedStore'
import { useFocusEffect } from 'expo-router'

const segments = ['Explore', 'Following'] as const

type Segment = (typeof segments)[number]

export default function HomeScreen() {
  const [segment, setSegment] = useState<Segment>('Explore')
  const { explore, following, toggleLike, toggleSave, addPost } = useFeedStore()
  const user = useAuthStore((s) => s.user)
  const role = user?.role || 'worshiper'

  const data = useMemo(() => (segment === 'Explore' ? explore : following), [segment, explore, following])

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
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

  const handlePublish = () => {
    if (!title || !body) {
      Toast.show({ type: 'error', text1: 'Add a title and message.' })
      return
    }
    addPost({
      authorId: user?.id || 'me',
      authorName: user?.name || 'You',
      faith: user?.faith,
      title,
      body,
      type: 'post',
    })
    setTitle('')
    setBody('')
    Toast.show({ type: 'success', text1: 'Published to feed' })
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
        <View className="mx-4 mb-4 mt-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <Text className="text-base font-semibold text-gray-900">Create a post</Text>
          <Text className="text-sm text-gray-600">Share guidance with your followers.</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            placeholderTextColor="#9CA3AF"
            className="mt-3 rounded-xl border border-gray-200 bg-white px-3 py-3 text-gray-900"
          />
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Message"
            placeholderTextColor="#9CA3AF"
            multiline
            className="mt-2 rounded-xl border border-gray-200 bg-white px-3 py-3 text-gray-900"
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />
          <SolidButton label="Publish" onPress={handlePublish} style={{ marginTop: 12 }} />
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
    </SafeAreaView>
  )
}
