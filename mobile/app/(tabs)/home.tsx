import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, Pressable, NativeScrollEvent, NativeSyntheticEvent, Animated, Dimensions, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { useLocalSearchParams , useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { PostCard } from '../../components/Feed/PostCard'
import ReelCard from '../../components/Reel/ReelCard'
import { CreatePostCTA } from '../../components/Feed/CreatePostCTA'
import { HomeHeader } from '../../components/Headers/HomeHeader'
import { CreatePostModal } from '../../components/Feed/CreatePostModal'
import { HomeSkeleton, PostCardSkeleton } from '../../components/Skeletons'
import { useAuthStore } from '../../stores/authStore'
import { useFeedStore } from '../../stores/feedStore'
import { useEngagementStore } from '../../stores/engagementStore'
import { useOfflineStore } from '../../stores/offlineStore'

import { toastConfig } from '../../components/ToastConfig'
import { postsApi } from '../../api/posts'
import { useFollowStore } from '../../stores/followStore'
import { useFeedAlgorithm } from '../../hooks/useFeedAlgorithm'
import { useNetworkSync } from '../../hooks/useNetworkSync'
import { useDebouncedRouter } from '../../hooks/useDebounce'
import { useHideTabOnScroll } from '../../hooks/useHideTabOnScroll'
import { cacheFeedForOffline, getCachedFeedForOffline } from '../../lib/caching'

type Segment = 'Explore' | 'Following'

export default function HomeScreen() {
  const router = useDebouncedRouter()
  const params = useLocalSearchParams()
  const [segment, setSegment] = useState<Segment>('Explore')
  const { explore, following, toggleLike, toggleSave, setFeed, setFollowing, setReels, setAuthorFaith } = useFeedStore()
  const { setLikes, setSaves, setReposts } = useEngagementStore()
  const user = useAuthStore((s) => s.user)
  const role = user?.role || 'worshiper'
  const [showCreatePostModal, setShowCreatePostModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [explorePage, setExplorePage] = useState(0)
  const [followingPage, setFollowingPage] = useState(0)
  
  // Initialize network sync for offline support
  const { isOffline } = useNetworkSync()

  // Initialize feed algorithm
  const { trackLike, trackSave, trackView, performRanking } = useFeedAlgorithm({
    autoRank: false,
    enableCaching: true,
  })

  // Wrap toggleLike to track interactions
  const handleLike = useCallback(async (postId: string) => {
    const post = [...explore, ...following].find(p => p.id === postId)
    toggleLike(postId)
    if (post) {
      try {
        await trackLike(postId, post.faith)
      } catch {
        // Queue the action if offline
        if (isOffline) {
          const { addToQueue } = useOfflineStore.getState()
          addToQueue({
            type: 'like',
            postId,
            payload: { isLike: true },
          })
        }
      }
    }
  }, [explore, following, toggleLike, trackLike, isOffline])

  // Wrap toggleSave to track interactions
  const handleSave = useCallback(async (postId: string) => {
    const post = [...explore, ...following].find(p => p.id === postId)
    toggleSave(postId)
    if (post) {
      try {
        await trackSave(postId, post.faith)
      } catch {
        // Queue the action if offline
        if (isOffline) {
          const { addToQueue } = useOfflineStore.getState()
          addToQueue({
            type: 'save',
            postId,
            payload: { isSaved: true },
          })
        }
      }
    }
  }, [explore, following, toggleSave, trackSave, isOffline])

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

  // Refetch following feed when follow state changes
  const followingIds = useFollowStore((state) => state.followingIds)
   
  useEffect(() => {
    const refetchFollowing = async () => {
      try {
        const followingPosts = await postsApi.getFollowing(20, 0)
        setFollowing(followingPosts)
        await cacheFeedForOffline('following_posts', followingPosts)
      } catch (error) {
        console.error('Failed to refetch following feed:', error)
        // Load from cache if fails
        const cached = await getCachedFeedForOffline('following_posts')
        if (cached) setFollowing(cached)
      }
    }
    
    refetchFollowing()
  }, [followingIds, setFollowing])

  // Load feed data on mount
   
  useEffect(() => {
    const loadFeed = async () => {
      try {
        const startTime = Date.now()
        setIsLoading(true)
        const { loadQueue } = useOfflineStore.getState()
        
        // Load offline queue on startup
        await loadQueue()

        try {
          // Load explore feed first (critical for initial render)
          console.log('[Feed] Loading explore feed...')
          const feedPosts = await postsApi.getFeed(20, 0)
          const exploreTime = Date.now()
          console.log(`[Feed] Explore feed loaded in ${exploreTime - startTime}ms`)
          
          setFeed(feedPosts)
          
          // Cache explore feed
          await cacheFeedForOffline('explore_posts', feedPosts)
          
          // Cache author faiths for scoring
          feedPosts.forEach((post) => {
            if (post.faith) {
              setAuthorFaith(post.authorId, post.faith)
            }
          })
          
          // Initialize engagement store with explore posts
          const likedIds = feedPosts.filter(p => p.isLiked).map(p => p.id)
          const savedIds = feedPosts.filter(p => p.isSaved).map(p => p.id)
          const repostedIds = feedPosts.filter(p => p.isReposted).map(p => p.id)
          
          setLikes(likedIds)
          setSaves(savedIds)
          setReposts(repostedIds)

          // Perform ranking on explore feed (critical)
          if (user?.id) {
            performRanking('explore')
          }
          
          console.log(`[Feed] Initial render ready in ${Date.now() - startTime}ms - loading following/reels in background`)
          
          // Load following and reels in background (not blocking)
          loadFollowingAndReels()
          
        } catch (fetchError) {
          // If offline or network error, try to load from cache
          console.warn('Network error, attempting to load from cache:', fetchError)
          
          const cachedExplore = await getCachedFeedForOffline('explore_posts')

          if (cachedExplore) {
            Toast.show({
              type: 'info',
              text1: 'Offline Mode',
              text2: 'Showing cached content',
            })

            setFeed(cachedExplore)
          } else {
            Toast.show({
              type: 'error',
              text1: 'Failed to load posts',
              text2: 'Check your connection',
            })
          }
        }
      } catch (error) {
        console.error('Failed to load feed:', error)
        Toast.show({
          type: 'error',
          text1: 'Failed to load posts',
          text2: 'Please try again',
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadFeed()
  }, [])

  // Load following and reels in background (deferred)
  const loadFollowingAndReels = async () => {
    try {
      const [followingPosts, reels] = await Promise.all([
        postsApi.getFollowing(20, 0),
        postsApi.getReels(20, 0),
      ])

      setFollowing(followingPosts)
      setReels(reels)
      
      // Cache following and reels
      await Promise.all([
        cacheFeedForOffline('following_posts', followingPosts),
        cacheFeedForOffline('reels', reels),
      ])

      // Perform ranking on following and reels after initial render
      if (user?.id) {
        performRanking('following')
        performRanking('reels')
      }
    } catch (error) {
      console.warn('Failed to load following and reels in background:', error)
      
      // Try to load from cache
      const [cachedFollowing, cachedReels] = await Promise.all([
        getCachedFeedForOffline('following_posts'),
        getCachedFeedForOffline('reels'),
      ])

      if (cachedFollowing) setFollowing(cachedFollowing)
      if (cachedReels) setReels(cachedReels)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear positions to free memory
      setReelPositions({})
      setPostPositions({})
      setVisibleReelId(null)
      setVisiblePostId(null)
    }
  }, [])

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

   
  const loadMore = useCallback(async () => {
    if (isLoadingMore) return
    
    try {
      setIsLoadingMore(true)
      
      // Ensure skeleton is visible for at least 500ms
      const startTime = Date.now()
      
      if (segment === 'Explore') {
        const nextPage = explorePage + 1
        const morePosts = await postsApi.getFeed(50, nextPage * 50)
        
        // Add minimum delay to show skeleton
        const elapsed = Date.now() - startTime
        if (elapsed < 500) {
          await new Promise(resolve => setTimeout(resolve, 500 - elapsed))
        }
        
        if (morePosts.length > 0) {
          setFeed([...explore, ...morePosts])
          setExplorePage(nextPage)
          setIsLoadingMore(false)
        }
        // If no posts, keep loading state true to show skeleton indefinitely
      } else {
        const nextPage = followingPage + 1
        const morePosts = await postsApi.getFollowing(50, nextPage * 50)
        
        // Add minimum delay to show skeleton
        const elapsed = Date.now() - startTime
        if (elapsed < 500) {
          await new Promise(resolve => setTimeout(resolve, 500 - elapsed))
        }
        
        if (morePosts.length > 0) {
          setFollowing([...following, ...morePosts])
          setFollowingPage(nextPage)
          setIsLoadingMore(false)
        }
        // If no posts, keep loading state true to show skeleton indefinitely
      }
    } catch (error) {
      console.error('Failed to load more posts:', error)
      Toast.show({
        type: 'error',
        text1: 'Failed to load more posts',
        text2: 'Please try again',
      })
      setIsLoadingMore(false)
    }
  }, [segment, explorePage, followingPage, explore, following, isLoadingMore])

  const loadMoreDebounceRef = useRef<NodeJS.Timeout | null>(null)
  
  const debouncedLoadMore = useCallback(() => {
    if (loadMoreDebounceRef.current) {
      clearTimeout(loadMoreDebounceRef.current)
    }
    loadMoreDebounceRef.current = setTimeout(() => {
      loadMore()
    }, 300)
  }, [loadMore])

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y
    const screenHeight = Dimensions.get('window').height
    const contentHeight = event.nativeEvent.contentSize.height
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

    // Auto-load when user scrolls to bottom (within 500 pixels)
    if (contentHeight - currentScrollY - screenHeight < 500 && !isLoadingMore) {
      debouncedLoadMore()
    }
    
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
      // Track view for visible reel
      const reel = data.find(item => item.type === 'reel' && item.id === closestReel)
      if (reel) {
        trackView(closestReel, reel.faith)
      }
    } else if (closestPost) {
      setVisiblePostId(closestPost)
      setVisibleReelId(null)
      // Track view for visible post
      const post = data.find(item => item.type === 'post' && item.id === closestPost)
      if (post) {
        trackView(closestPost, post.faith)
      }
    }
  }, [reelPositions, postPositions, data, trackView, isLoadingMore, debouncedLoadMore])

  const onHideScroll = useHideTabOnScroll()

  const handleReelLayout = useCallback((reelId: string, event: any) => {
    const { y, height } = event.nativeEvent.layout
    setReelPositions(prev => {
      const updated = { ...prev, [reelId]: { y, height } }
      // Keep only positions for items currently in view (limit to 20)
      const keys = Object.keys(updated)
      if (keys.length > 20) {
        const toRemove = keys.slice(0, keys.length - 20)
        toRemove.forEach(key => delete updated[key])
      }
      return updated
    })
  }, [])

  const handlePostLayout = useCallback((postId: string, event: any) => {
    const { y, height } = event.nativeEvent.layout
    setPostPositions(prev => {
      const updated = { ...prev, [postId]: { y, height, type: 'post' } }
      // Keep only positions for items currently in view (limit to 20)
      const keys = Object.keys(updated)
      if (keys.length > 20) {
        const toRemove = keys.slice(0, keys.length - 20)
        toRemove.forEach(key => delete updated[key])
      }
      return updated
    })
  }, [])

  const handlePost = async (content: string, media?: string | null) => {
    setShowCreatePostModal(false)
    // Show loading state while refreshing
    Toast.show({ type: 'success', text1: 'Post published! Updating feed...' })
    // Refresh the feed to show the new post
    await refreshFeed()
  }

  const refreshFeed = async () => {
    try {
      setIsLoading(true)
      const [feedPosts, followingPosts, reels] = await Promise.all([
        postsApi.getFeed(50, 0),
        postsApi.getFollowing(50, 0),
        postsApi.getReels(50, 0),
      ])
      if (feedPosts && feedPosts.length > 0) {
        setFeed(feedPosts)
      }
      if (followingPosts && followingPosts.length > 0) {
        setFollowing(followingPosts)
      }
      if (reels && reels.length > 0) {
        setReels(reels)
      }

      // Perform ranking on refresh to improve feed
      if (user?.id) {
        performRanking('explore')
        performRanking('following')
        performRanking('reels')
      }
    } catch (error) {
      console.error('Failed to refresh feed:', error)
      Toast.show({
        type: 'error',
        text1: 'Failed to load posts',
        text2: 'Please try again',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {isLoading && data.length === 0 ? (
        <HomeSkeleton segment={segment} onSegmentChange={setSegment} isAtTop={isAtTop} isOffline={isOffline} />
      ) : (
        <View className="relative flex-1" style={{ overflow: 'hidden' }}>
          <Animated.View 
            className="absolute top-0 left-0 right-0 z-50 bg-white"
            style={{
              transform: [{ translateY: headerTranslateY }],
              opacity: headerOpacity,
            }}
          >
            <HomeHeader segment={segment} onSegmentChange={setSegment} isAtTop={isAtTop} isOffline={isOffline} />
          </Animated.View>
          <ScrollView 
            className="flex-1" 
            contentContainerStyle={{ paddingBottom: 32, paddingTop: isOffline ? 160 : 120 }}
            onScroll={(e) => { onHideScroll(e); handleScroll(e); }}
            scrollEventThrottle={16}
            removeClippedSubviews={true}
            refreshControl={
              <RefreshControl 
                refreshing={isLoading} 
                onRefresh={refreshFeed}
                tintColor="black"
              />
            }
          >
            {role === 'leader' && segment === 'Explore' && explore.filter(p => p.authorId === user?.id).length === 0 && (
              <CreatePostCTA onPress={() => setShowCreatePostModal(true)} />
            )}
            
            {segment === 'Following' && following.length === 0 && (
              <View className="mx-4 mt-8 rounded-2xl bg-gray-50 p-6 items-center">
                <Ionicons name="people-outline" size={48} color="#3b82f6" />
                <Text className="text-base font-semibold text-gray-900 mt-4">No leaders followed yet</Text>
                <Text className="text-xs text-gray-600 mt-2 text-center">Follow leaders to see their updates in your feed</Text>
                <Pressable 
                  onPress={() => router.push('/(tabs)/leaders')}
                  className="mt-4 bg-blue-500 px-4 py-2 rounded-xl"
                >
                  <Text className="text-white text-sm font-semibold">Follow Leaders</Text>
                </Pressable>
              </View>
            )}
            
        {data.map((item, index) => (
          <View key={`${item.type}-${item.id}`} onLayout={(e) => item.type === 'reel' ? handleReelLayout(item.id, e) : handlePostLayout(item.id, e)}>
            {item.type === 'reel' ? (
              <ReelCard item={item} onLike={handleLike} onSave={handleSave} isVisible={visibleReelId === item.id} isScreenFocused={isScreenFocused} />
            ) : (
              <PostCard item={item} onLike={handleLike} onSave={handleSave} isVisible={visiblePostId === item.id && item.mediaType === 'video'} />
            )}
          </View>
        ))}
        {/* Loading skeleton when fetching more */}
        {isLoadingMore && !(segment === 'Following' && following.length === 0) && (
          <View>
            <PostCardSkeleton />
          </View>
        )}
          </ScrollView>
        </View>
      )}

      <CreatePostModal
        visible={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        onPost={handlePost}
      />
      <Toast config={toastConfig} />
    </SafeAreaView>
  )
}
