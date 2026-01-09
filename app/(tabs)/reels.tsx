import { View, Dimensions, ScrollView, NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import { useFeedStore } from '../../stores/feedStore'
import { VideoView, useVideoPlayer } from 'expo-video'
import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react'
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { ReelHeader } from '../../components/Reel/ReelHeader'
import { ReelActions } from '../../components/Reel/ReelActions'
import { ReelUserInfo } from '../../components/Reel/ReelUserInfo'

const TAB_BAR_HEIGHT = 85

export default function ReelsScreen() {
  const { explore, toggleLike, toggleSave } = useFeedStore()
  const { height: WINDOW_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window')
  const VISIBLE_HEIGHT = WINDOW_HEIGHT - TAB_BAR_HEIGHT
  const reels = explore.filter((p) => p.type === 'reel')
  const router = useRouter()
  const { reelId } = useLocalSearchParams<{ reelId: string }>()
  const initialIndex = reelId ? reels.findIndex((r) => r.id === reelId) : 0
  const [isMuted, setIsMuted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollViewRef = useRef<ScrollView>(null)
  const isScreenFocused = useRef(true)
  const videoPlayers = useRef<Map<string, any>>(new Map())
  const currentIndexRef = useRef(0)
  const hasInitialized = useRef(false)
  const previousReelIdRef = useRef<string | undefined>(undefined)

  // Set initial index based on reelId - run when reelId changes
  useLayoutEffect(() => {
    // Only run if reelId is different from the previous one (not on every data change)
    if (reelId && reelId !== previousReelIdRef.current && reels.length > 0) {
      previousReelIdRef.current = reelId
      hasInitialized.current = true
      const index = reels.findIndex((r) => r.id === reelId)
      if (index !== -1) {
        setCurrentIndex(index)
        currentIndexRef.current = index
        // Scroll to initial position immediately
        scrollViewRef.current?.scrollTo({
          y: index * VISIBLE_HEIGHT,
          animated: false,
        })
      }
    }
  }, [reelId])

  // Update ref when currentIndex changes
  useEffect(() => {
    currentIndexRef.current = currentIndex
  }, [currentIndex])

  // Handle scroll to change reel
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Reset initialization flag when user scrolls
    hasInitialized.current = false

    const contentOffsetY = event.nativeEvent.contentOffset.y
    const index = Math.round(contentOffsetY / VISIBLE_HEIGHT)
    
    if (index !== currentIndexRef.current && index >= 0 && index < reels.length) {
      // Pause previous video
      const prevReel = reels[currentIndexRef.current]
      if (prevReel && videoPlayers.current.has(prevReel.id)) {
        videoPlayers.current.get(prevReel.id)?.pause()
      }
      
      setCurrentIndex(index)
      currentIndexRef.current = index
      
      // Play new video
      const newReel = reels[index]
      if (newReel && videoPlayers.current.has(newReel.id) && isScreenFocused.current) {
        videoPlayers.current.get(newReel.id)?.play()
      }
    }
  }, [reels])

  // Handle screen focus
  useFocusEffect(
    useCallback(() => {
      isScreenFocused.current = true
      const currentReel = reels[currentIndex]
      if (currentReel && videoPlayers.current.has(currentReel.id)) {
        videoPlayers.current.get(currentReel.id)?.play()
      }
      
      return () => {
        isScreenFocused.current = false
        // Pause all videos
        videoPlayers.current.forEach(player => player.pause())
      }
    }, [currentIndex, reels])
  )

  if (reels.length === 0) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <View className="text-white">No reels available</View>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {/* Fixed Header */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <ReelHeader onBack={() => router.back()} onCameraPress={() => {}} />
      </View>

      {/* Scrollable Content - no shell, full screen */}
      <ScrollView
        ref={scrollViewRef}
        onMomentumScrollEnd={handleScroll}
        pagingEnabled={true}
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
      >
          {reels.map((reel, index) => (
            <ReelItem
              key={reel.id}
              reel={reel}
              index={index}
              isActive={index === currentIndex}
              isMuted={isMuted}
              screenHeight={VISIBLE_HEIGHT}
              screenWidth={SCREEN_WIDTH}
              onLikePress={() => toggleLike(reel.id)}
              onSavePress={() => toggleSave(reel.id)}
              onPlayerReady={(player) => {
                videoPlayers.current.set(reel.id, player)
              }}
              isScreenFocused={isScreenFocused.current}
            />
          ))}
        </ScrollView>
      </View>
    )
  }
  
  // Separate component for each reel item
  function ReelItem({ 
    reel,
    index,
    isActive, 
    isMuted, 
    screenHeight, 
    screenWidth,
    onLikePress,
    onSavePress,
    onPlayerReady,
    isScreenFocused
  }: {
    reel: any
    index: number
    isActive: boolean
    isMuted: boolean
    screenHeight: number
    screenWidth: number
    onLikePress: () => void
    onSavePress: () => void
    onPlayerReady: (player: any) => void
    isScreenFocused: boolean
  }) {
  const player = useVideoPlayer(reel.media || '', (player) => {
    player.loop = true
    player.muted = isMuted
    onPlayerReady(player)
  })

  // Auto-play when active
  useEffect(() => {
    if (isActive && isScreenFocused) {
      player.play()
    } else {
      player.pause()
    }
  }, [isActive, isScreenFocused, player])

  return (
    <View style={{ height: screenHeight, width: screenWidth }}>
   {/* LAYER 1: VIDEO */}
      {/* This fills the WHOLE screen, including behind the tabs. */}
      {/* NO bottom padding here! */}
      <VideoView
        style={{ flex: 1, width: '100%', height: '100%' }}
        player={player}
        contentFit="cover"
        nativeControls={false}
      />
      
   {/* LAYER 2: UI OVERLAY */}
      {/* THIS is where you use the bottom spacing. */}
      {/* It floats on top of the video, respecting the tab bar height. */}
      
      {/* Actions (Right side) */}
      <View style={{ 
        position: 'absolute', 
        bottom: 0, // Safe space above tabs (85 + 15 buffer)
        right: 12,
        zIndex: 20 
      }}>
        <ReelActions
          reel={{
            id: reel.id,
            likes: reel.likes || 0,
            isLiked: reel.isLiked,
            comments: reel.comments || 0,
            saves: reel.saves || 0,
            isSaved: reel.isSaved,
          }}
          onLikePress={onLikePress}
          onSavePress={onSavePress}
        />
      </View>

      {/* User Info (Left side) */}
      <View style={{ 
        position: 'absolute', 
        bottom: 0, // Safe space above tabs
        left: 4,
        right: 60, // Leave room for right-side buttons
        zIndex: 20
      }}>
        <ReelUserInfo
          reel={{
            id: reel.id,
            authorName: reel.authorName || 'Unknown',
            authorAvatar: reel.authorAvatar,
            body: reel.body || '',
          }}
          onFollowPress={() => {}}
        />
      </View>
    </View>
  )
}