import { View, Text, Pressable, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { Post } from '../../stores/feedStore'
import { WebView } from 'react-native-webview'
import { SolidButton } from '../Buttons/SolidButtonTwo'
import { leadersApi } from '../../api/leaders'
import { useFollowStore } from '../../stores/followStore'
import { useEngagementStore } from '../../stores/engagementStore'
import { useAuthStore } from '../../stores/authStore'
import Toast from 'react-native-toast-message'

interface Props {
  post: Post
  onLike: () => void
  onSave: () => void
  isFollowing?: boolean
  onFollowChange?: (isFollowing: boolean) => void
}

const formatCount = (num: number | undefined | null) => {
  if (num === undefined || num === null || isNaN(num)) return '0'
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export const PostDetail = ({ post, onLike, onSave, isFollowing = false, onFollowChange }: Props) => {
  const router = useRouter()
  const { isFollowing: checkFollowing, addFollowing, removeFollowing } = useFollowStore()
  const following = checkFollowing(post.authorId)
  const user = useAuthStore((s) => s.user)
  const [loading, setLoading] = useState(false)
  const [localPost, setLocalPost] = useState(post)

  // Keep localPost in sync when parent `post` prop changes
  // This ensures likes/saves/reposts updated by parent are reflected here immediately
  useEffect(() => {
    setLocalPost(post)
  }, [post])

  const handleFollowPress = async () => {
    try {
      setLoading(true)
      if (following) {
        await leadersApi.unfollowLeader(post.authorId)
        removeFollowing(post.authorId)
        Toast.show({
          type: 'success',
          text1: 'Unfollowed',
          text2: `You unfollowed ${post.authorName}`,
        })
      } else {
        await leadersApi.followLeader(post.authorId)
        addFollowing(post.authorId)
        Toast.show({
          type: 'success',
          text1: 'Following',
          text2: `You are now following ${post.authorName}`,
        })
      }
      onFollowChange?.(!following)
    } catch (error: any) {
      console.error('Follow error:', error)
      Toast.show({
        type: 'error',
        text1: 'Failed to update follow status',
        text2: error?.response?.data?.message || 'Please try again',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLocalLike = () => {
    // Optimistic local update
    setLocalPost((p) => ({
      ...p!,
      isLiked: !p!.isLiked,
      likes: p!.isLiked ? p!.likes - 1 : p!.likes + 1,
    }))
    try {
      onLike()
    } catch (err) {
      console.warn('Parent like handler error:', err)
      // best-effort revert by refetch or leave to parent
    }
  }

  const handleLocalSave = () => {
    setLocalPost((p) => ({
      ...p!,
      isSaved: !p!.isSaved,
      saves: p!.isSaved ? p!.saves - 1 : p!.saves + 1,
    }))
    try {
      onSave()
    } catch (err) {
      console.warn('Parent save handler error:', err)
    }
  }
  return (
    <View className="bg-white px-5">
      {/* Header */}
      <View className="mb-4 mt-4 flex-row items-start justify-between">
        <Pressable className="flex-1 flex-row items-center gap-3" onPress={() => router.push(`/profile/${post.authorId}`)}>
          {/* Avatar */}
          {post.authorAvatar ? (
            <Image
              source={{ uri: post.authorAvatar }}
              className="h-12 w-12 rounded-full bg-gray-200"
            />
          ) : (
            <View className="h-12 w-12 rounded-full bg-gray-200" />
          )}
          <View className="flex-1">
            <View className="flex-row items-center gap-1">
              <Text className="text-base font-bold text-[#111111]">{post.authorName}</Text>
              <Ionicons name="checkmark-circle" size={14} color="#007AFF" />
            </View>
            <Text className="text-xs text-[#999999]">1 hour ago</Text>
          </View>
        </Pressable>
        {!user || user.id !== post.authorId ? (
          <SolidButton 
            label={following ? 'Following' : 'Follow'} 
            onPress={handleFollowPress}
            disabled={loading}
            variant={following ? 'secondary' : 'primary'}
            style={{ paddingVertical: 8, paddingHorizontal: 20 }}
          />
        ) : null}
      </View>

      {/* Post Content */}
      <View>
        {/* Post Text */}
        {localPost.mediaType !== 'video' && (
          <Text className="mb-1 text-sm text-[#666666]">{localPost.body}</Text>
        )}

        {/* Video */}
        {localPost.mediaType === 'video' && localPost.media ? (
          <View className="mb-3">
            <View className="h-[300px] overflow-hidden rounded-xl bg-black">
              <WebView
                source={{ 
                  html: `
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                          body { 
                            margin: 0; 
                            padding: 0; 
                            background: #000; 
                            display: flex; 
                            justify-content: center; 
                            align-items: center; 
                            height: 100vh; 
                          }
                          video { 
                            width: 100%; 
                            height: 100%; 
                            object-fit: contain; 
                          }
                        </style>
                      </head>
                      <body>
                        <video controls playsinline>
                          <source src="${localPost.media}" type="video/mp4">
                        </video>
                      </body>
                    </html>
                  `
                }}
                allowsFullscreenVideo
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}              
                className="flex-1"
              />
            </View>
            {localPost.title && <Text className="mt-3 text-base font-bold text-[#111111]">{localPost.title}</Text>}
            <Text className="mt-2 text-sm leading-6 text-[#666666]">{localPost.body}</Text>
          </View>
        ) : null}

        {/* Image */}
        {localPost.mediaType === 'image' && localPost.media ? (
          <View className="mb-3 h-[350px] overflow-hidden rounded-xl bg-gray-100">
            <Image
              source={{ uri: localPost.media }}
              className="h-full w-full"
              resizeMode="cover"
            />
          </View>
        ) : null}
      </View>

      {/* Engagement Metrics */}
      <View className="flex-row border-b border-[#f0f0f0] items-center justify-between py-4">
        {/* Left Side: Comment, Like, Share */}
        <View className="flex-row items-center gap-6">
          <Pressable className="flex-row items-center gap-2">
            <Ionicons name="chatbubble-outline" size={20} color="#666666" />
            <Text className="text-sm font-semibold text-[#111111]">{formatCount(localPost.comments)}</Text>
          </Pressable>
          
          <Pressable className="flex-row items-center gap-2" onPress={handleLocalLike}>
            <Ionicons 
              name={localPost.isLiked ? 'heart' : 'heart-outline'} 
              size={20} 
              color={localPost.isLiked ? '#f472b6' : '#666666'} 
            />
            <Text className="text-sm font-semibold text-[#111111]">{formatCount(localPost.likes)}</Text>
          </Pressable>
          
          <Pressable 
            className="flex-row items-center gap-2" 
            onPress={() => {
              const currentReposts = localPost.reposts || 0
              const newReposts = localPost.isReposted ? currentReposts - 1 : currentReposts + 1
              setLocalPost({ ...localPost, isReposted: !localPost.isReposted, reposts: newReposts })
              // Fire and forget
              useEngagementStore.getState().toggleRepost(localPost.id, localPost.isReposted).catch(err => {
                console.warn('Repost error:', err)
                // Revert on error
                setLocalPost({ ...localPost, isReposted: localPost.isReposted, reposts: currentReposts })
              })
            }}
          >
            <Ionicons 
              name="repeat" 
              size={20} 
              color={localPost.isReposted ? '#007AFF' : '#666666'} 
            />
            <Text className={`text-sm font-semibold ${localPost.isReposted ? 'text-[#007AFF]' : 'text-[#111111]'}`}>{formatCount(localPost.reposts || 0)}</Text>
          </Pressable>
        </View>

        {/* Right Side: Save */}
        <Pressable 
          className={`flex-row items-center gap-2 rounded-2xl px-5 py-2 ${
            localPost.isSaved ? 'bg-[#DCEBFF]' : ''
          }`}
          onPress={handleLocalSave}
        >
          <Ionicons 
            name={localPost.isSaved ? 'bookmark' : 'bookmark-outline'} 
            size={18} 
            color={localPost.isSaved ? '#007AFF' : '#666666'} 
          />
          <Text className={`text-sm font-semibold ${localPost.isSaved ? 'text-[#007AFF]' : 'text-[#111111]'}`}>{formatCount(localPost.saves)}</Text>
        </Pressable>
      </View>
    </View>
  )
}
