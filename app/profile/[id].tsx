import { useState } from 'react'
import { View, ScrollView, Text } from 'react-native'
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

export default function ProfileScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { explore, following } = useFeedStore()
  
  const [activeTab, setActiveTab] = useState<ProfileTab>((user?.role || 'worshipper') === 'worshipper' ? 'Saved' : 'Posts')
  const [isFollowing, setIsFollowing] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  // Determine if this is the user's own profile
  const isOwnProfile = user?.id === id

  // Mock profile data - in a real app, this would come from a store or API
  const profileData = {
    id: id as string,
    name: 'Sujan Bhatta',
    username: 's.u.jan_02',
    avatar: 'https://d3o8hbmq1ueggw.cloudfront.net/6o9ta%2Fpreview%2F74407596%2Fmain_large.png?response-content-disposition=inline%3Bfilename%3D%22main_large.png%22%3B&response-content-type=image%2Fpng&Expires=1768033610&Signature=Y3~brtzTpzfRWJA3~~tTqzZa3D9~dzIY3BlWNUaureKKu9Q2kQaWqOyiAxKJABhDsfbtJyK~7uwYHJzjKPACOPNKPzdE6VgRtJmVXZaEbyzllbSt4rK-UypVzRLdC5Tx24FkOGJrgi1mK-4Kx6acqEuVgAg8aN07HP6nMiMo-2aFrSs0FBgXTeFDdARBQzs3Vmlc5WZjVCeu7yEic0139u4GHB-WX9keja06EnxM1~IiDTBvrS3ekJymnLazSaczGUBn5tC~JkV-q4o~eP4ytvPXYgk0JdKECvZsuELUeP0X1FqzmB8nCq6ezuL0W78S13Lri8IqbDzmzNefnowKnw__&Key-Pair-Id=APKAJT5WQLLEOADKLHBQ',
    faith: isOwnProfile ? user?.faith || 'Christianity' : 'Christianity',
    role: isOwnProfile ? user?.role || 'worshipper' : 'worshipper',
    isVerified: false,
    postsCount: 1270,
    followersCount: 1200,
    followingCount: 12,
  }

  // Determine if this is a leader profile based on the profileData role
  const isLeader = profileData.role === 'leader'

  // Update follower count and verification based on role
  if (isLeader) {
    profileData.followersCount = 224000100
  }
  profileData.isVerified = isLeader

  // Get user's posts from feed
  const allPosts = [...explore, ...following]
  const userPosts = allPosts
    .filter((post) => post.authorId === id)
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
      text2: isFollowing ? `You unfollowed ${profileData.name}` : `You are now following ${profileData.name}`,
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
    router.replace('/auth/login')
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
        username={profileData.username} 
        isOwnProfile={isOwnProfile}
        onMenuPress={() => setShowMenu(true)}
      />
      
      <ScrollView className="flex-1">
        {/* Profile Header */}
        <ProfileHeader
          name={profileData.name}
          username={profileData.username}
          avatar={profileData.avatar}
          faith={profileData.faith}
          role={profileData.role}
          isVerified={profileData.isVerified}
          isOwnProfile={isOwnProfile}
          isLeader={isLeader}
          postsCount={profileData.postsCount}
          followersCount={profileData.followersCount}
          followingCount={profileData.followingCount}
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
