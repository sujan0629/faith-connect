import { useEffect, useState } from 'react'
import { View, ScrollView, Text, RefreshControl, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams , Stack } from 'expo-router'

import { useDebouncedRouter } from '../../hooks/useDebounce'
import { Ionicons } from '@expo/vector-icons'
import { ProfileTopBar } from '../../components/Profile/ProfileTopBar'
import { ProfileHeader } from '../../components/Profile/ProfileHeader'
import { ProfileTabs, ProfileTab } from '../../components/Profile/ProfileTabs'
import { ProfileMenuModal } from '../../components/Profile/ProfileMenuModal'
import { AccountActionModal } from '../../components/Profile/AccountActionModal'
import { ReportModal } from '../../components/Moderation/ReportModal'
import { BlockUserModal } from '../../components/Moderation/BlockUserModal'
import { useAuthStore } from '../../stores/authStore'
import { useFeedStore } from '../../stores/feedStore'
import { useFollowStore } from '../../stores/followStore'
import { useProfileStore } from '../../stores/profileStore'
import { useChatStore } from '../../stores/chatStore'
import Toast from 'react-native-toast-message'
import { ProfileSkeleton } from '../../components/Skeletons/ProfileSkeleton'
import { usersApi } from '../../api/users'
import { leadersApi } from '../../api/leaders'
import { ProfileActions } from '@/components/Profile/ProfileActions'
import { postsApi } from '../../api/posts'
import { PostCard } from '../../components/Feed/PostCard'
import ReelCard from '../../components/Reel/ReelCard'
import type { Post } from '../../stores/feedStore'

export default function ProfileScreen() {
  const { id } = useLocalSearchParams()
  const router = useDebouncedRouter()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const updateUser = useAuthStore((s) => s.updateUser)
  const profileId = Array.isArray(id) ? id[0] : (id as string | undefined)
  
  const [activeTab, setActiveTab] = useState<ProfileTab>('Posts')

  // Determine if this is the user's own profile
  const isOwnProfile = user?.id === profileId

  const { addFollowing, removeFollowing, followingIds } = useFollowStore()
  const isFollowing = profileId ? followingIds.has(profileId) : false
  const loading = useProfileStore((s) => s.loading)
  const setGlobalLoading = useProfileStore((s) => s.setLoading)
  const setProfileCache = useProfileStore((s) => s.setProfileCache)
  const getProfileCache = useProfileStore((s) => s.getProfileCache)
  const [isBlocked] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showAccountActionModal, setShowAccountActionModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)
  
  const [error, setError] = useState<string | null>(null)
  const profile = useProfileStore((s) => s.currentProfile)
  const setProfile = useProfileStore((s) => s.setCurrentProfile)
  const [stats, setStats] = useState<{ followersCount: number; followingCount: number }>({ followersCount: 0, followingCount: 0 })
  const [authorPosts, setAuthorPosts] = useState<Post[]>([])
  const [savedPosts, setSavedPosts] = useState<Post[]>([])
  const [repostedPosts, setRepostedPosts] = useState<Post[]>([])
  const { toggleLike, toggleSave } = useFeedStore()
  const [refreshing, setRefreshing] = useState(false)

  
  const { threads } = useChatStore()

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      // Refetch profile data
      if (isOwnProfile && user?.id) {
        const res = await usersApi.getMe()
        setProfile(res)
        const myStats = await usersApi.getMyStats()
        setStats(myStats)
        const posts = await postsApi.getAuthorPosts(user.id)
        setAuthorPosts(posts)
        const saved = await postsApi.getSavedPosts()
        setSavedPosts(saved)
        const reposts = await postsApi.getRepostedPosts()
        setRepostedPosts(reposts)
      } else if (profileId) {
        const res = await usersApi.getById(profileId)
        setProfile(res)
        if (res.isFollowing) addFollowing(profileId)
        else removeFollowing(profileId)
        setStats({
          followersCount: res.followersCount ?? 0,
          followingCount: res.followingCount ?? 0,
        })
        const posts = await postsApi.getAuthorPosts(profileId)
        setAuthorPosts(posts)
        const reposts = await postsApi.getRepostedPosts(20, 0, profileId)
        setRepostedPosts(reposts)
      }
    } catch (error) {
      console.error('Failed to refresh profile', error)
    } finally {
      setRefreshing(false)
    }
  }

  // Set default tab based on profile ownership and role
  useEffect(() => {
    const currentProfile = profile || (isOwnProfile ? user : null)
    const currentRole = currentProfile?.role || 'worshiper'
    const currentIsLeader = currentRole === 'leader'
    if (isOwnProfile) {
      setActiveTab(currentIsLeader ? 'Posts' : 'Saved')
    } else {
      setActiveTab(currentIsLeader ? 'Posts' : 'Repost')
    }
  }, [isOwnProfile, profile, user])

  // Determine if this is the user's own profile
  useEffect(() => {
    let active = true
    const fetchProfile = async () => {
      setError(null)
      let didSetLoading = false

      try {
        // Serve from tiny in-memory cache immediately if available
        if (profileId) {
          const cached = getProfileCache(profileId)
          if (cached && active) {
            setProfile(cached)
            if (cached.isFollowing) addFollowing(profileId)
            else removeFollowing(profileId)
            setStats({
              followersCount: cached.followersCount ?? 0,
              followingCount: cached.followingCount ?? 0,
            })
            // don't show global loading when serving cached data
          } else if (active) {
            setGlobalLoading(true)
            didSetLoading = true
          }
        } else if (isOwnProfile && active && !getProfileCache(user?.id || '')) {
          setGlobalLoading(true)
          didSetLoading = true
        }

        if (isOwnProfile && user?.id) {
          // parallelize independent calls for speed
          const [res, myStats, posts, saved, reposts] = await Promise.all([
            usersApi.getMe(),
            usersApi.getMyStats(),
            postsApi.getAuthorPosts(user.id),
            postsApi.getSavedPosts(),
            postsApi.getRepostedPosts(),
          ])
          if (!active) return
          setProfile(res)
          // sync auth store if changed
          const current = user
          if (current && JSON.stringify(current) !== JSON.stringify(res)) {
            updateUser(res)
          }
          setStats(myStats)
          setAuthorPosts(posts)
          setSavedPosts(saved)
          setRepostedPosts(reposts)
          // cache
          if (user.id) setProfileCache(user.id, res)
          return
        }

        if (profileId) {
          // parallelize author fetches
          const [res, posts, reposts] = await Promise.all([
            usersApi.getById(profileId),
            postsApi.getAuthorPosts(profileId),
            postsApi.getRepostedPosts(20, 0, profileId),
          ])
          if (!active) return
          setProfile(res)
          if (res.isFollowing) addFollowing(profileId)
          else removeFollowing(profileId)
          setStats({
            followersCount: res.followersCount ?? 0,
            followingCount: res.followingCount ?? 0,
          })
          setAuthorPosts(posts)
          setRepostedPosts(reposts)
          // cache
          setProfileCache(profileId, res)
          return
        }

        throw new Error('No profile id provided')
      } catch (err: any) {
        console.warn('Failed to load profile', err?.response?.data || err?.message)
        if (active) {
          setError(err?.response?.data?.message || 'Failed to load profile')
          setProfile(isOwnProfile ? user ?? null : null)
        }
      } finally {
        if (active && didSetLoading) setGlobalLoading(false)
      }
    }

    fetchProfile()
    return () => {
      active = false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId, isOwnProfile, user?.id, updateUser])

  

  const displayProfile = profile || (isOwnProfile ? user : null)
  const displayName = displayProfile?.name || 'User not found'
  const displayUsername = displayProfile?.username || displayProfile?.email?.split('@')[0] || 'user'
  const displayAvatar = displayProfile?.avatar
  const displayFaith = displayProfile?.faith || 'Unknown'
  const displayRole = displayProfile?.role || 'Unknown'
  const isLeader = displayRole === 'leader'

  // Filter posts based on active tab
  const getTabContent = (): Post[] => {
    switch (activeTab) {
      case 'Posts':
        return authorPosts.filter((p) => p.type === 'post' && (p.mediaType === 'image' || p.mediaType === 'video' || p.mediaType === 'none'))
      case 'Reels':
        return authorPosts.filter((p) => p.type === 'reel')
      case 'Saved':
        return savedPosts
      case 'Repost':
        return repostedPosts
      case 'Replies':
        return [] // Would come from user's replies
      default:
        return authorPosts
    }
  }
  
        if (loading) {
          return (
            <SafeAreaView className="flex-1 bg-white" edges={['top']}>
              <ProfileTopBar 
                username={displayUsername}
                isOwnProfile={isOwnProfile}
                onMenuPress={() => {
                  if (isOwnProfile) {
                    setShowMenu(true)
                  } else {
                    setShowAccountActionModal(true)
                  }
                }}
              />
              <ProfileSkeleton />
            </SafeAreaView>
          )
        }
  

  const handleFollowPress = async () => {
    try {
      if (isFollowing) {
        await leadersApi.unfollowLeader(profileId!)
        removeFollowing(profileId!)
        Toast.show({
          type: 'success',
          text1: 'Unfollowed',
          text2: `You unfollowed ${displayName}`,
        })
      } else {
        await leadersApi.followLeader(profileId!)
        addFollowing(profileId!)
        
        Toast.show({
          type: 'success',
          text1: 'Following',
          text2: `You are now following ${displayName}`,
        })
      }
    } catch (error: any) {
      console.error('Follow error:', error)
      Toast.show({
        type: 'error',
        text1: 'Failed to update follow status',
        text2: error?.response?.data?.message || 'Please try again',
      })
    }
  }
  const handleMessagePress = async () => {
    Toast.show({
      type: 'info',
      text1: 'Messages',
      text2: 'Opening conversation...',
    })
    if (!profileId) return;
    const existingThread = threads.find((t) => t.peerId === profileId)
    if (existingThread) {
      router.push(`/messages/${existingThread.id}`)
      return
    }

    // Navigate immediately to a pending thread id so the ChatSkeleton shows instantly.
    const pendingId = `pending-${profileId}-${Date.now()}`
    router.push(`/messages/${pendingId}`)

    // Insert an optimistic pending thread so header/avatar show immediately
    useChatStore.getState().addPendingThread({
      id: pendingId,
      peerId: profileId!,
      peerName: displayName,
      lastMessage: '',
      unread: 0,
      avatar: displayAvatar,
      isActive: false,
      timestamp: new Date(),
    })

    // Do NOT create thread yet — we'll create it when the user sends the first message.
    // In background: check backend for an existing thread with this peer. If found,
    // remove the optimistic pending thread immediately to avoid duplicates and
    // navigate to the real thread id (replace so the user doesn't see a back navigation).
    ;(async () => {
      try {
        const { messagesApi } = await import('../../api/messages')
        const remoteThreads = await messagesApi.listThreads()
        const found = remoteThreads.find((t) => t.peerId === profileId)
        if (found) {
          // remove pending and map it to real id in the store to avoid duplicates.
          // Do NOT navigate — keep the optimistic pending route but map it so
          // the chat screen shows the real thread in-place.
          useChatStore.getState().setPendingMapping(pendingId, found.id)
        }
      } catch (err) {
        // ignore network errors — we'll create thread when sending message
        console.warn('[Profile] failed to verify remote thread', err)
      }
    })()
  }

  const handleEditPress = () => {
    router.push('/onboarding/profile')
  }

  const handleLogout = () => {
    logout()
    setShowMenu(false)
    router.replace('/')
  }

  const handleContactPress = () => {
    Toast.show({
      type: 'info',
      text1: 'Contact',
      text2: 'Opening contact options...',
    })
  }

  const handleStatsPress = (type: 'posts' | 'followers' | 'following') => {
    Toast.show({
      type: 'info',
      text1: type.charAt(0).toUpperCase() + type.slice(1),
      text2: `Viewing ${type}...`,
    })
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        {/* Top Bar */}
        <ProfileTopBar 
        username={displayUsername} 
        isOwnProfile={isOwnProfile}
        onMenuPress={() => {
          if (isOwnProfile) {
            setShowMenu(true)
          } else {
            setShowAccountActionModal(true)
          }
        }}
      />
      
      <ScrollView className="flex-1" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
        {/* Profile Header */}
        <ProfileHeader
          name={displayName}
          username={displayUsername}
          avatar={displayAvatar}
          faith={displayFaith}
          role={displayRole as any}
          isVerified={isLeader}
          isOwnProfile={isOwnProfile}
          isLeader={isLeader}
          postsCount={authorPosts.length}
          repostsCount={repostedPosts.length}
          followersCount={stats.followersCount}
          followingCount={stats.followingCount}
          onPostsPress={() => handleStatsPress('posts')}
          onFollowersPress={() => handleStatsPress('followers')}
          onFollowingPress={() => handleStatsPress('following')}
        />

           {/* Action Buttons (for other users) */}
        {!isOwnProfile && (
          <ProfileActions
            isFollowing={isFollowing}
            onFollowPress={handleFollowPress}
            onMessagePress={handleMessagePress}
            onContactPress={handleContactPress}
            isLeader={isLeader}
            viewerIsLeader={user?.role === 'leader'}
            leaderId={profileId}
            profileName={displayName}
            profileUsername={displayUsername}
          />
        )}

        {isOwnProfile && (
          <ProfileActions
            onEditPress={handleEditPress}
            onContactPress={handleContactPress}
            isOwnProfile={isOwnProfile}
            isLeader={user?.role === 'leader'}
            profileName={displayName}
            profileUsername={displayUsername}
          />
        )}


        {/* Profile Tabs */}
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          showAll={isOwnProfile}
          isLeader={isLeader}
          isOwnProfile={isOwnProfile}
        />

        {/* Content - Grid Layout */}
        {getTabContent().length > 0 ? (
          <View className="px-1">
            <FlatList
              data={getTabContent()}
              renderItem={({ item: post }) => (
                <View className="w-1/3 p-1">
                  {post.type === 'reel' ? (
                    <ReelCard
                      key={post.id}
                      item={post}
                      onLike={toggleLike}
                      onSave={toggleSave}
                      isProfileView={true}
                      defaultMuted={true}
                    />
                  ) : (
                    <PostCard
                      key={post.id}
                      item={post}
                      onLike={toggleLike}
                      onSave={toggleSave}
                      isProfileView={true}
                    />
                  )}
                </View>
              )}
              keyExtractor={(item) => item.id}
              numColumns={4}
              scrollEnabled={false}
            />
          </View>
        ) : (
          <View className="flex-1 items-center justify-center py-16">
            <Ionicons 
              name={
                activeTab === 'Posts' ? 'document-outline' : 
                activeTab === 'Reels' ? 'videocam-outline' : 
                activeTab === 'Saved' ? 'bookmark-outline' : 
                activeTab === 'Repost' ? 'repeat-outline' : 
                'chatbubble-outline'
              }
              size={48}
              color="#999999"
            />
            <Text className="mt-4 text-sm text-gray-500 px-4 text-center">
              {activeTab === 'Posts' ? 'No posts yet' : 
               activeTab === 'Reels' ? 'No reels yet' : 
               activeTab === 'Saved' ? 'No saved yet' : 
               activeTab === 'Repost' ? 'No reposts yet' : 
               'No replies yet'}
            </Text>
          </View>
        )}

        {error && (
          <View className="px-4 py-3">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        )}
      </ScrollView>

      <ProfileMenuModal
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        onLogout={handleLogout}
      />

      {!isOwnProfile && (
        <>
          <AccountActionModal
            visible={showAccountActionModal}
            onClose={() => setShowAccountActionModal(false)}
            onReport={() => {
              setShowAccountActionModal(false)
              setShowReportModal(true)
            }}
            onBlock={() => {
              setShowAccountActionModal(false)
              setShowBlockModal(true)
            }}
          />

          <ReportModal
            visible={showReportModal}
            onClose={() => setShowReportModal(false)}
            contentType="user"
            contentId={profileId!}
          />

          <BlockUserModal
            visible={showBlockModal}
            onClose={() => setShowBlockModal(false)}
            userId={profileId!}
            userName={displayName}
            userAvatar={displayAvatar}
            isBlocked={isBlocked}
          />
        </>
      )}
    </SafeAreaView>
    </>
  )
}
