import { View, Dimensions, ScrollView, NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import { useFeedStore } from '../../stores/feedStore'
import { VideoView, useVideoPlayer, VideoPlayer } from 'expo-video'
import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react'
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { ReelHeader } from '../../components/Reel/ReelHeader'
import { ReelActions } from '../../components/Reel/ReelActions'
import { ReelUserInfo } from '../../components/Reel/ReelUserInfo'
import { CreateReelModal } from '../../components/Feed/CreateReelModal'
import { Comment } from '../posts/[id]'

const TAB_BAR_HEIGHT = 85

export default function ReelsScreen() {
  const { explore, toggleLike, toggleSave } = useFeedStore()
  const { height: WINDOW_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window')
  const VISIBLE_HEIGHT = WINDOW_HEIGHT - TAB_BAR_HEIGHT
  const reels = explore.filter((p) => p.type === 'reel')
  const router = useRouter()
  const { reelId } = useLocalSearchParams<{ reelId: string }>()
  const [isMuted, setIsMuted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [createReelModalVisible, setCreateReelModalVisible] = useState(false)

  const [reelComments, setReelComments] = useState<Record<string, Comment[]>>({
    'p2': [
      {
        id: 'c1',
        authorId: 'u1',
        authorName: 'Sarah Johnson',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
        text: 'Amazing perspective! This really captures the essence of community.',
        likes: 24,
        isLiked: false,
        replies: 0,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'c2',
        authorId: 'u2',
        authorName: 'Michael Chen',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
        text: 'Beautiful! The lighting in this video is incredible.',
        likes: 12,
        isLiked: true,
        replies: 0,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ],
    'p4': [
      {
        id: 'c3',
        authorId: 'u3',
        authorName: 'Priya Patel',
        authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
        text: 'This touched my heart. Faith communities like this are so important.',
        likes: 45,
        isLiked: false,
        replies: 0,
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
    ],
  })

  const scrollViewRef = useRef<ScrollView>(null)
  const isScreenFocused = useRef(true)
  const videoPlayers = useRef<Map<string, VideoPlayer>>(new Map())
  const currentIndexRef = useRef(0)
  const hasInitialized = useRef(false)
  const previousReelIdRef = useRef<string | undefined>(undefined)

  useLayoutEffect(() => {
    if (reelId && reelId !== previousReelIdRef.current && reels.length > 0) {
      previousReelIdRef.current = reelId
      hasInitialized.current = true
      const index = reels.findIndex((r) => r.id === reelId)
      if (index !== -1) {
        setCurrentIndex(index)
        currentIndexRef.current = index
        scrollViewRef.current?.scrollTo({
          y: index * VISIBLE_HEIGHT,
          animated: false,
        })
      }
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
        videoPlayers.current.get(prevReel.id)?.pause()
      }
      setCurrentIndex(index)
      currentIndexRef.current = index
      const newReel = reels[index]
      if (newReel && videoPlayers.current.has(newReel.id) && isScreenFocused.current) {
        videoPlayers.current.get(newReel.id)?.play()
      }
    }
  }, [reels])

  useFocusEffect(
    useCallback(() => {
      isScreenFocused.current = true
      const currentReel = reels[currentIndex]
      if (currentReel && videoPlayers.current.has(currentReel.id)) {
        videoPlayers.current.get(currentReel.id)?.play()
      }
      return () => {
        isScreenFocused.current = false
        videoPlayers.current.forEach(player => player.pause())
      }
    }, [currentIndex, reels])
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

  if (reels.length === 0) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <View className="text-white">No reels available</View>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <ReelHeader 
          onBack={() => router.back()} 
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
        {reels.map((reel, index) => (
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
  const player = useVideoPlayer(reel.media || '', (player) => {
    player.loop = true
    player.muted = isMuted
    onPlayerReady(player)
  })

  useEffect(() => {
    if (isActive && isScreenFocused) {
      player.play()
    } else {
      player.pause()
    }
  }, [isActive, isScreenFocused, player])

  return (
    <View style={{ height: screenHeight, width: screenWidth }}>
      <VideoView
        style={{ flex: 1, width: '100%', height: '100%' }}
        player={player}
        contentFit="cover"
        nativeControls={false}
      />
      
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
          }}
          onLikePress={onLikePress}
          onSavePress={onSavePress}
          comments={reelComments[reel.id] || []}
          onLikeComment={onLikeComment}
          onAddComment={(text: string) => onAddComment(reel.id, text)}
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