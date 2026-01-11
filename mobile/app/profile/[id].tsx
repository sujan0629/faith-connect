import { useEffect, useState } from 'react'
import { View, ScrollView, Text, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ProfileTopBar } from '../../components/Profile/ProfileTopBar'
import { ProfileHeader } from '../../components/Profile/ProfileHeader'
import { ProfileTabs, ProfileTab } from '../../components/Profile/ProfileTabs'
import { ProfileGrid } from '../../components/Profile/ProfileGrid'
import { ProfileActions } from '../../components/Profile/ProfileActions'
import { ProfileMenuModal } from '../../components/Profile/ProfileMenuModal'
import { useAuthStore } from '../../stores/authStore'
import { useFeedStore } from '../../stores/feedStore'
import Toast from 'react-native-toast-message'
import { api } from '../../api/axios'

export default function ProfileScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const updateUser = useAuthStore((s) => s.updateUser)
  const { explore, following } = useFeedStore()
  const profileId = Array.isArray(id) ? id[0] : (id as string | undefined)
  
  const [activeTab, setActiveTab] = useState<ProfileTab>((user?.role || 'worshiper') === 'worshiper' ? 'Saved' : 'Posts')
  const [isFollowing, setIsFollowing] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any | null>(null)

  // Determine if this is the user's own profile
  const isOwnProfile = user?.id === profileId

  useEffect(() => {
    let active = true
    const fetchProfile = async () => {
      setLoading(true)
      try {
        if (isOwnProfile && user?.id) {
          const res = await api.get('/users/me')
          if (!active) return
          setProfile(res.data)
          // Only push to auth store if something actually changed to avoid render loops
          const current = user
          if (current && JSON.stringify(current) !== JSON.stringify(res.data)) {
            updateUser(res.data)
          }
          return
        }

        const all = [...explore, ...following]
        const authored = all.find((p) => p.authorId === profileId)
        if (active) {
          setProfile(
            authored
              ? {
                  id: authored.authorId,
                  name: authored.authorName,
                  faith: authored.faith,
                  avatar: authored.authorAvatar,
                  role: 'leader',
                }
              : null,
          )
        }
      } catch (error: any) {
        console.warn('Failed to load profile', error?.response?.data || error?.message)
        if (active) setProfile(isOwnProfile ? user ?? null : null)
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchProfile()
    return () => {
      active = false
    }
  }, [profileId, isOwnProfile, user?.id, explore, following, updateUser])

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#111" />
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

  // Get user's posts from feed
  const allPosts = [...explore, ...following]
  const userPosts = allPosts
    .filter((post) => post.authorId === profileId)
    .map((post) => ({
      id: post.id,
      thumbnail: post.media,
      mediaType: post.mediaType === 'video' ? 'video' as const : post.mediaType === 'image' ? 'image' as const : undefined,
      likesCount: post.likes,
      commentsCount: post.comments,
    }))

  // Filter based on active tab
  const getTabContent = () => {
    switch (activeTab) {
      case 'Posts':
        return userPosts.filter((p) => p.mediaType === 'image' || p.mediaType === undefined)
      case 'Reels':
        return userPosts.filter((p) => p.mediaType === 'video')
      case 'Saved':
        return [] // Would come from saved posts store
      case 'Repost':
        return [] // Would come from reposted posts
      case 'Replies':
        return [] // Would come from user's replies
      case 'Likes':
        return [] // Would come from liked posts store
      default:
        return userPosts
    }
  }

  const handleFollowPress = () => {
    setIsFollowing(!isFollowing)
    Toast.show({
      type: 'success',
      text1: isFollowing ? 'Unfollowed' : 'Following',
      text2: isFollowing ? `You unfollowed ${displayName}` : `You are now following ${displayName}`,
    })
  }

  const handleMessagePress = () => {
    Toast.show({
      type: 'info',
      text1: 'Messages',
      text2: 'Opening conversation...',
    })
    // Navigate to messages
    // router.push(`/messages/${id}`)
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
        onMenuPress={() => setShowMenu(true)}
      />
      
      <ScrollView className="flex-1">
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
          postsCount={userPosts.length}
          followersCount={0}
          followingCount={0}
          onPostsPress={() => handleStatsPress('posts')}
          onFollowersPress={() => handleStatsPress('followers')}
          onFollowingPress={() => handleStatsPress('following')}
          onEditProfile={handleEditPress}
          onShareProfile={handleSharePress}
          onContact={handleContactPress}
          onFollow={handleFollowPress}
          onMessage={handleMessagePress}
        />

        {/* Action Buttons (for other users) */}
        {!isOwnProfile && (
          <ProfileActions
            isFollowing={isFollowing}
            onFollowPress={handleFollowPress}
            onMessagePress={handleMessagePress}
            onMorePress={() => Toast.show({ type: 'info', text1: 'More options' })}
            isLeader={isLeader}
          />
        )}

        {/* Profile Tabs */}
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          showAll={isOwnProfile}
          isLeader={isLeader}
        />

        {/* Content Grid */}
        <ProfileGrid items={getTabContent()} onItemPress={handlePostPress} isLeader={isLeader} />
      </ScrollView>

      <ProfileMenuModal
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        onLogout={handleLogout}
      />
    </SafeAreaView>
  )
}
