import { View, Dimensions, ScrollView, NativeScrollEvent, NativeSyntheticEvent, Pressable } from 'react-native'
import { useFeedStore } from '../../stores/feedStore'
import { useAuthStore } from '../../stores/authStore'
import { VideoView, useVideoPlayer, VideoPlayer } from 'expo-video'
import React, { useState, useRef, useEffect, useCallback, useLayoutEffect, useMemo } from 'react'
import { useLocalSearchParams, useFocusEffect } from 'expo-router'
import { useDebouncedRouter } from '../../hooks/useDebounce'
import { ReelHeader } from '../../components/Reel/ReelHeader'
import { ReelActions } from '../../components/Reel/ReelActions'
import { ReelUserInfo } from '../../components/Reel/ReelUserInfo'
import { CreateReelModal } from '../../components/Feed/CreateReelModal'
import { Comment } from '../../stores/commentStore'
import { useFeedAlgorithm } from '../../hooks/useFeedAlgorithm'
import { ReelSkeleton } from '@/components/Skeletons/ReelSkeleton'
import { postsApi } from '../../api/posts'
import { useOfflineStore } from '../../stores/offlineStore'
import { /* cacheFeedForOffline, getCachedFeedForOffline */ } from '../../lib/caching'
import Ionicons from '@expo/vector-icons/Ionicons'

const TAB_BAR_HEIGHT = 0;

export default function ReelsScreen() {
  const { reels: storeReels, toggleLike, toggleSave } = useFeedStore()
  const user = useAuthStore((s) => s.user)
  const { height: WINDOW_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window')
  const VISIBLE_HEIGHT = WINDOW_HEIGHT - TAB_BAR_HEIGHT
  const router = useDebouncedRouter()
  const { reelId } = useLocalSearchParams<{ reelId: string }>()
  // network/offline flags intentionally omitted when unused to avoid lint warnings
  // Initialize feed algorithm for tracking watch events
  const { trackView } = useFeedAlgorithm({
    autoRank: true,
    enableCaching: true,
  })
  
  // Sort reels: clicked reel first, then rest sorted by time
  const baseReels = storeReels
  const reels = useMemo(() => {
    return reelId 
      ? (() => {
          const clickedReel = baseReels.find(r => r.id === reelId)
          return clickedReel 
            ? [clickedReel, ...baseReels.filter(r => r.id !== reelId)]
            : baseReels
        })()
      : baseReels
  }, [reelId, baseReels])
  const [isMuted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [createReelModalVisible, setCreateReelModalVisible] = useState(false)

  const [reelComments, setReelComments] = useState<Record<string, Comment[]>>({})

  const scrollViewRef = useRef<ScrollView>(null)
  const isScreenFocused = useRef(true)
  const videoPlayers = useRef<Map<string, VideoPlayer>>(new Map())
  const currentIndexRef = useRef(0)
  const hasInitialized = useRef(false)
  const previousReelIdRef = useRef<string | undefined>(undefined)

  // Cleanup all video players on unmount
   
  useEffect(() => {
    return () => {
      videoPlayers.current.forEach((player) => {
        try {
          player.pause()
          player.release?.()
        } catch {
          // Player might already be released
        }
      })
      videoPlayers.current.clear()
    }
  }, [])

   
  useLayoutEffect(() => {
    if (reelId && reelId !== previousReelIdRef.current && reels.length > 0) {
      previousReelIdRef.current = reelId
      hasInitialized.current = true
      // Clicked reel is now always at index 0 after reordering
      setCurrentIndex(0)
      currentIndexRef.current = 0
      scrollViewRef.current?.scrollTo({
        y: 0,
        animated: false,
      })
    }
  }, [reelId])

  useEffect(() => {
    currentIndexRef.current = currentIndex
  }, [currentIndex])

   
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    hasInitialized.current = false
    const contentOffsetY = event.nativeEvent.contentOffset.y
    const index = Math.round(contentOffsetY / VISIBLE_HEIGHT)
    
    if (index !== currentIndexRef.current && index >= 0 && index < reels.length) {
      const prevReel = reels[currentIndexRef.current]
      if (prevReel && videoPlayers.current.has(prevReel.id)) {
        const prevPlayer = videoPlayers.current.get(prevReel.id)
        if (prevPlayer) {
          prevPlayer.pause()
        }
      }
      setCurrentIndex(index)
      currentIndexRef.current = index
      const newReel = reels[index]
      if (newReel && videoPlayers.current.has(newReel.id) && isScreenFocused.current) {
        const newPlayer = videoPlayers.current.get(newReel.id)
        if (newPlayer) {
          newPlayer.play()
        }
      }
    }
  }, [reels, VISIBLE_HEIGHT])

  useFocusEffect(
    useCallback(() => {
      isScreenFocused.current = true
      // Use ref to get current reel without adding reels to dependencies
      const currentReel = reels[currentIndex]
      if (currentReel && videoPlayers.current.has(currentReel.id)) {
        const player = videoPlayers.current.get(currentReel.id)
        if (player) {
          player.play()
          // Track view event when reel starts playing
          if (user?.id) {
            trackView(currentReel.id, currentReel.faith)
          }
        }
      }
      return () => {
        isScreenFocused.current = false
        videoPlayers.current.forEach(player => {
          try {
            player.pause()
          } catch {
            // Player might be invalidated, ignore
          }
        })
      }
    }, [currentIndex, user?.id, trackView])
  )

  const onLikeComment = useCallback((commentId: string) => {
    setReelComments(prev => {
      const updated = { ...prev }
      Object.keys(updated).forEach(id => {
        updated[id] = updated[id].map(comment =>
          comment.id === commentId
            ? { ...comment, isLiked: !comment.isLiked, likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1 }
            : comment
        )
      })
      return updated
    })
  }, [])

  const onAddComment = useCallback((reelId: string, text: string) => {
    const newComment: Comment = {
      id: `c${Date.now()}`,
      authorId: 'currentUser',
      authorName: 'You',
      authorAvatar: undefined,
      text,
      likes: 0,
      isLiked: false,
      replies: 0,
      createdAt: new Date().toISOString(),
    }
    setReelComments(prev => ({
      ...prev,
      [reelId]: [newComment, ...(prev[reelId] || [])]
    }))
  }, [])

  // Cleanup old players from map to prevent unbounded growth
   
  useEffect(() => {
    // Only cleanup if reels array length changed significantly
    if (reels.length > 0) {
      const currentReelIds = new Set(reels.map(r => r.id))
      const playerIds = Array.from(videoPlayers.current.keys())
      
      // Only cleanup players that are no longer in the reel list
      playerIds.forEach(playerId => {
        if (!currentReelIds.has(playerId)) {
          const player = videoPlayers.current.get(playerId)
          if (player) {
            try {
              player.pause()
              player.release?.()
            } catch {
              // Already released
            }
            videoPlayers.current.delete(playerId)
          }
        }
      })
    }
  }, [reels.length])

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <ReelHeader 
          onBack={() => {
            // If from profile, go back to profile. Otherwise just stay on reels tab
            if (reelId) {
              // User came from a profile/deep link, allow back
              router.back()
            } else {
              // User is on reels tab normally, don't navigate away
              // Just clear the player state if needed
            }
          }}
          onCreateReelPress={() => setCreateReelModalVisible(true)}
        />
      </View>

      <ScrollView
        ref={scrollViewRef}
        onMomentumScrollEnd={handleScroll}
        pagingEnabled={true}
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
      >
        {reels.length > 0 ? reels.map((reel, index) => (
          <ReelItem
            key={reel.id}
            reel={reel}
            isActive={index === currentIndex}
            isMuted={isMuted}
            screenHeight={VISIBLE_HEIGHT}
            screenWidth={SCREEN_WIDTH}
            onLikePress={() => toggleLike(reel.id)}
            onSavePress={() => toggleSave(reel.id)}
            onPlayerReady={(player: VideoPlayer) => {
              videoPlayers.current.set(reel.id, player)
            }}
            isScreenFocused={isScreenFocused.current}
            reelComments={reelComments}
            onLikeComment={onLikeComment}
            onAddComment={onAddComment}
          />
        )) : [1, 2, 3].map((i) => (
          <ReelSkeleton
            key={i}
            screenHeight={VISIBLE_HEIGHT}
            screenWidth={SCREEN_WIDTH}
          />
        ))}
      </ScrollView>

      <CreateReelModal
        visible={createReelModalVisible}
        onClose={() => setCreateReelModalVisible(false)}
        videoUri={null}
        onPost={() => setCreateReelModalVisible(false)}
      />
    </View>
  )
}

// MOVED OUTSIDE AND WRAPPED IN MEMO TO STOP RELOADING ON STATE CHANGE
const ReelItem = React.memo(({ 
  reel,
  isActive, 
  isMuted, 
  screenHeight, 
  screenWidth,
  onLikePress,
  onSavePress,
  onPlayerReady,
  isScreenFocused,
  reelComments,
  onLikeComment,
  onAddComment
}: {
  reel: any
  isActive: boolean
  isMuted: boolean
  screenHeight: number
  screenWidth: number
  onLikePress: () => void
  onSavePress: () => void
  onPlayerReady: (player: VideoPlayer) => void
  isScreenFocused: boolean
  reelComments: Record<string, Comment[]>
  onLikeComment: (commentId: string) => void
  onAddComment: (reelId: string, text: string) => void
}) => {
  const [localMuted, setLocalMuted] = useState(false)
  const [showMuteIcon, setShowMuteIcon] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const muteIconTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const player = useVideoPlayer(reel.media || '', (player) => {
    player.loop = true
    player.muted = localMuted || isMuted
    onPlayerReady(player)
  })

  // Watch time tracking
  const watchTimeRef = useRef(0)
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isOffline = useOfflineStore((state) => state.isOffline)

  useEffect(() => {
    if (isActive && isScreenFocused) {
      if (!isPaused) {
        player.play()
      }
    } else {
      player.pause()
    }
  }, [isActive, isScreenFocused, player, isPaused])

  // Update player mute state when localMuted changes
  useEffect(() => {
    if (player) {
      player.muted = localMuted || isMuted
    }
  }, [localMuted, isMuted, player])

  // Track watch time every 500ms when reel is active
  useEffect(() => {
    if (!isActive || !isScreenFocused) return

    const trackInterval = setInterval(() => {
      watchTimeRef.current += 0.5 // 500ms = 0.5 seconds
    }, 500)

    return () => clearInterval(trackInterval)
  }, [isActive, isScreenFocused])

  // Batch send watch events every 2 seconds
  useEffect(() => {
    if (!isActive || !isScreenFocused) {
      // Clear any pending batch send
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current)
      }
      return
    }

    batchTimeoutRef.current = setInterval(async () => {
      if (watchTimeRef.current > 0) {
        try {
          const videoDuration = reel.videoDuration || 0
          
          await postsApi.trackWatch(reel.id, watchTimeRef.current, videoDuration)
          watchTimeRef.current = 0
        } catch (error) {
          console.error('Failed to track watch time:', error)
          
          // Queue watch event if offline
          if (isOffline) {
            const { addToQueue } = useOfflineStore.getState()
            addToQueue({
              type: 'like',
              postId: reel.id,
              payload: {},
            })
            watchTimeRef.current = 0
          }
        }
      }
    }, 2000)

    return () => {
      if (batchTimeoutRef.current) {
        clearInterval(batchTimeoutRef.current)
      }
    }
  }, [isActive, isScreenFocused, reel.id, reel.videoDuration, isOffline])

  // Cleanup player on unmount
  useEffect(() => {
    return () => {
      try {
        player.pause()
        player.release?.()
      } catch {
        // Already released
      }
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current)
      }
      if (muteIconTimeoutRef.current) {
        clearTimeout(muteIconTimeoutRef.current)
      }
    }
  }, [player])

  return (
    <View style={{ height: screenHeight, width: screenWidth }}>
      <Pressable
        style={{ flex: 1, width: '100%', height: '100%' }}
        onPress={() => {
          // Toggle mute on tap
          setLocalMuted(prev => !prev)
          setShowMuteIcon(true)
          
          // Clear previous timeout
          if (muteIconTimeoutRef.current) {
            clearTimeout(muteIconTimeoutRef.current)
          }
          
          // Hide mute icon after 1 second
          muteIconTimeoutRef.current = setTimeout(() => {
            setShowMuteIcon(false)
          }, 1000)
        }}
        onLongPress={() => {
          // Pause on long press
          player.pause()
          setIsPaused(true)
        }}
        onPressOut={() => {
          // Resume on release if was paused by long press
          if (isPaused && isActive && isScreenFocused) {
            player.play()
            setIsPaused(false)
          }
        }}
        delayLongPress={300}
      >
        <VideoView
          style={{ flex: 1, width: '100%', height: '100%' }}
          player={player}
          contentFit="cover"
          nativeControls={false}
        />
        
        {/* Mute Icon Overlay */}
        {showMuteIcon && (
          <View style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginLeft: -24,
            marginTop: -24,
            zIndex: 15
          }}>
            <Ionicons
              name={localMuted ? "volume-mute" : "volume-high"}
              size={48}
              color="white"
            />
          </View>
        )}
      </Pressable>
      
      <View style={{ 
        position: 'absolute', 
        bottom: 4, 
        right: 2,
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
            reposts: reel.reposts || 0,
            isReposted: reel.isReposted,
          }}
          onLikePress={onLikePress}
          onSavePress={onSavePress}
          comments={reelComments[reel.id] || []}
          onLikeComment={onLikeComment}
          onAddComment={(text: string) => onAddComment(reel.id, text)}
          authorId={reel.authorId}
          authorName={reel.authorName}
          authorAvatar={reel.authorAvatar}
        />
      </View>

      <View style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 4,
        right: 60, 
        zIndex: 20
      }}>
        <ReelUserInfo
          reel={{
            id: reel.id,
            authorId: reel.authorId,
            authorName: reel.authorName || 'Unknown',
            authorAvatar: reel.authorAvatar,
            body: reel.body || '',
          }}
          onFollowPress={() => {}}
        />
      </View>
    </View>
  )
})
ReelItem.displayName = 'ReelItem'