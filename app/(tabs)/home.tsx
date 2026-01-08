import { useMemo, useState, useRef, useEffect } from 'react'
import { View, Text, ScrollView, Pressable, TextInput, NativeScrollEvent, NativeSyntheticEvent, Animated } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { PostCard } from '../../components/Feed/PostCard'
import { ReelCard } from '../../components/Feed/ReelCard'
import { HomeHeader } from '../../components/Headers/HomeHeader'
import { SolidButton } from '../../components/Buttons/SolidButton'
import { useAuthStore } from '../../stores/authStore'
import { useFeedStore } from '../../stores/feedStore'

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
  const scrollY = useRef(0)
  const headerTranslateY = useRef(new Animated.Value(0)).current
  const headerOpacity = useRef(new Animated.Value(1)).current

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
    
    setIsAtTop(currentScrollY < 50)
    
    if (currentScrollY < 50) {
      // Near top, always show header
      setIsHeaderVisible(true)
    } else if (currentScrollY > scrollY.current) {
      // Scrolling down (swiping up) - hide header
      setIsHeaderVisible(false)
    } else if (currentScrollY < scrollY.current) {
      // Scrolling up (swiping down) - show header
      setIsHeaderVisible(true)
    }
    
    scrollY.current = currentScrollY
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
          <ReelCard key={item.id} item={item} onLike={toggleLike} onSave={toggleSave} />
        ) : (
          <PostCard key={item.id} item={item} onLike={toggleLike} onSave={toggleSave} />
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
