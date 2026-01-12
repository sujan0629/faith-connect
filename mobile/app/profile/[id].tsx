import { useEffect, useState } from 'react'
import { View, ScrollView, Text, ActivityIndicator, FlatList, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { ProfileTopBar } from '../../components/Profile/ProfileTopBar'
import { ProfileHeader } from '../../components/Profile/ProfileHeader'
import { ProfileTabs, ProfileTab } from '../../components/Profile/ProfileTabs'
import { ProfileGrid } from '../../components/Profile/ProfileGrid'
import { ProfileMenuModal } from '../../components/Profile/ProfileMenuModal'
import { AccountActionModal } from '../../components/Profile/AccountActionModal'
import { ReportModal } from '../../components/Moderation/ReportModal'
import { BlockUserModal } from '../../components/Moderation/BlockUserModal'
import { useAuthStore } from '../../stores/authStore'
import { useFeedStore } from '../../stores/feedStore'
import { useFollowStore } from '../../stores/followStore'
import Toast from 'react-native-toast-message'
import { api } from '../../api/axios'
import { usersApi } from '../../api/users'
import { leadersApi } from '../../api/leaders'
import { ProfileActions } from '@/components/Profile/ProfileActions'
import { postsApi } from '../../api/posts'
import { PostCard } from '../../components/Feed/PostCard'
import ReelCard from '../../components/Reel/ReelCard'
import type { Post } from '../../stores/feedStore'

export default function ProfileScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const updateUser = useAuthStore((s) => s.updateUser)
  const { explore, following } = useFeedStore()
  const { addFollowing, removeFollowing } = useFollowStore()
  const profileId = Array.isArray(id) ? id[0] : (id as string | undefined)
  
  const [activeTab, setActiveTab] = useState<ProfileTab>('Posts')

  // Determine if this is the user's own profile
  const isOwnProfile = user?.id === profileId

  const [isFollowing, setIsFollowing] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showAccountActionModal, setShowAccountActionModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [stats, setStats] = useState<{ followersCount: number; followingCount: number }>({ followersCount: 0, followingCount: 0 })
  const [authorPosts, setAuthorPosts] = useState<Post[]>([])
  const [savedPosts, setSavedPosts] = useState<Post[]>([])
  const [repostedPosts, setRepostedPosts] = useState<Post[]>([])
  const { toggleLike, toggleSave } = useFeedStore()
  const [refreshing, setRefreshing] = useState(false)

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
        setIsFollowing(res.isFollowing ?? false)
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
      setLoading(true)
      setError(null)
      try {
        if (isOwnProfile && user?.id) {
          const res = await usersApi.getMe()
          if (!active) return
          setProfile(res)
          // sync auth store if changed
          const current = user
          if (current && JSON.stringify(current) !== JSON.stringify(res)) {
            updateUser(res)
          }
          const myStats = await usersApi.getMyStats()
          if (!active) return
          setStats(myStats)
          
          // Fetch user's own posts
          const posts = await postsApi.getAuthorPosts(user.id)
          if (!active) return
          setAuthorPosts(posts)

          // Fetch user's saved posts
          const saved = await postsApi.getSavedPosts()
          if (!active) return
          setSavedPosts(saved)

          // Fetch user's reposted posts
          const reposts = await postsApi.getRepostedPosts()
          if (!active) return
          setRepostedPosts(reposts)
          return
        }

        if (profileId) {
          const res = await usersApi.getById(profileId)
          if (!active) return
          setProfile(res)
          setIsFollowing(res.isFollowing ?? false)
          setStats({
            followersCount: res.followersCount ?? 0,
            followingCount: res.followingCount ?? 0,
          })
          // Fetch author's posts
          const posts = await postsApi.getAuthorPosts(profileId)
          if (!active) return
          setAuthorPosts(posts)

          // Fetch user's reposted posts
          const reposts = await postsApi.getRepostedPosts(20, 0, profileId)
          if (!active) return
          setRepostedPosts(reposts)
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
        if (active) setLoading(false)
      }
    }

    fetchProfile()
    return () => {
      active = false
    }
  }, [profileId, isOwnProfile, user?.id, updateUser])

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="small" color="#222" />
      </SafeAreaView>
    )
  }

  const displayProfile = profile || (isOwnProfile ? user : null)
  const displayName = displayProfile?.name || 'FaithConnect user'
  const displayUsername = displayProfile?.username || displayProfile?.email?.split('@')[0] || 'faithconnect'
  const displayAvatar = displayProfile?.avatar
  const displayFaith = displayProfile?.faith || 'Christianity'
  const displayRole = displayProfile?.role || 'worshiper'
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

  const handleFollowPress = async () => {
    try {
      if (isFollowing) {
        await leadersApi.unfollowLeader(profileId!)
        removeFollowing(profileId!)
        setIsFollowing(false)
        Toast.show({
          type: 'success',
          text1: 'Unfollowed',
          text2: `You unfollowed ${displayName}`,
        })
      } else {
        await leadersApi.followLeader(profileId!)
        addFollowing(profileId!)
        setIsFollowing(true)
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

  const { createThread } = require('../../stores/chatStore').useChatStore.getState();
  const handleMessagePress = async () => {
    Toast.show({
      type: 'info',
      text1: 'Messages',
      text2: 'Opening conversation...',
    })
    if (!profileId) return;
    try {
      const threadId = await createThread(profileId);
      router.push(`/messages/${threadId}`);
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Failed to start chat', text2: err?.response?.data?.message || 'Please try again' });
    }
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

  const handleSharePress = () => {
    Toast.show({
      type: 'success',
      text1: 'Share',
      text2: 'Profile link copied!',
    })
  }

  const handlePostPress = (postId: string) => {
    router.push(`/posts/${postId}` as any)
  }

  const handleStatsPress = (type: 'posts' | 'followers' | 'following') => {
    Toast.show({
      type: 'info',
      text1: type.charAt(0).toUpperCase() + type.slice(1),
      text2: `Viewing ${type}...`,
    })
  }

  return (
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
  )
}
