import { View, Text, Pressable, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Post } from '../../stores/feedStore'
import { VideoView, useVideoPlayer } from 'expo-video'
import { useState, useEffect, memo } from 'react'
import { useRouter } from 'expo-router'
import { useEngagementStore } from '../../stores/engagementStore'
import { ReportModal } from '../Moderation/ReportModal'
import { BlockUserModal } from '../Moderation/BlockUserModal'
import { PostActionModal } from './PostActionModal'

interface Props {
  item: Post
  onLike: (id: string) => void
  onSave: (id: string) => void
  isVisible?: boolean
  isProfileView?: boolean
}

const formatCount = (num: number | undefined | null) => {
  if (num === undefined || num === null || isNaN(num)) return '0'
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export const PostCard = ({ item, onLike, onSave, isVisible = false, isProfileView = false }: Props) => {
  const [showReportModal, setShowReportModal] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [showActionMenu, setShowActionMenu] = useState(false)
  
  const router = useRouter()
  const { isLiked, isSaved, isReposted, toggleLike, toggleSave, toggleRepost } = useEngagementStore()

  const player = useVideoPlayer(item.media || '', player => {
    player.loop = true
    player.muted = true
    if (isVisible && item.mediaType === 'video') {
      player.play()
    } else {
      player.pause()
    }
  })

  // Cleanup player on unmount
  useEffect(() => {
    return () => {
      // Defer heavy cleanup off the main synchronous unmount path so navigation isn't blocked.
      setTimeout(() => {
        try {
          player.pause()
          player.release?.()
        } catch {
          // Player might already be released
        }
      }, 0)
    }
  }, [player])

  const handlePress = () => {
    router.push(`/posts/${item.id}` as any)
  }

  if (isProfileView) {
    return (
      <Pressable onPress={handlePress}>
        <View className="bg-white pb-3">
          {/* Image Card */}
          {item.mediaType === 'image' && item.media ? (
            <View className="h-[200px] overflow-hidden rounded-xl bg-gray-100">
              <Image
                source={{ uri: item.media }}
                className="h-full w-full"
                resizeMode="cover"
              />
            </View>
          ) : null}

          {/* Video Card */}
          {item.mediaType === 'video' && item.media ? (
            <View className="h-[200px] overflow-hidden rounded-xl bg-black">
              <VideoView
                player={player}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                allowsPictureInPicture={false}
                pointerEvents="none"
              />
            </View>
          ) : null}

          {/* Text-only preview for profile grid */}
          {(!item.media || item.mediaType === 'none') && (
            <View className="h-[200px] overflow-hidden rounded-xl bg-gray-50 border border-gray-200 px-3 py-3 justify-center">
              <Text numberOfLines={6} className="text-sm text-gray-700">{item.body || '""'}</Text>
            </View>
          )}
        </View>
      </Pressable>
    )
  }

  return (
    <>
      <Pressable onPress={handlePress}>
        <View className="border-b border-[#f0f0f0] bg-white px-5 pb-5 pt-4">
        {/* Header */}
        <View className="mb-2.5 flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center gap-2.5">
          {/* Avatar */}
          {item.authorAvatar ? (
            <Image
              source={{ uri: item.authorAvatar }}
              className="h-8 w-8 rounded-full bg-gray-200"
            />
          ) : (
            <View className="h-8 w-8 rounded-full bg-gray-200" />
          )}
          <View className="flex-1">
            <View className="flex-row items-center gap-1">
              <Text className="text-base font-bold text-[#111111]">{item.authorName}</Text>
              <Ionicons name="checkmark-circle" size={14} color="#007AFF" />
            </View>
          </View>
        </View>
        <Pressable
          onPress={() => setShowActionMenu(!showActionMenu)}
          className="p-2"
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#666" />
        </Pressable>
      </View>

      {/* Action Menu Modal */}
      <PostActionModal
        visible={showActionMenu}
        onClose={() => setShowActionMenu(false)}
        onReport={() => {
          setShowReportModal(true)
          setShowActionMenu(false)
        }}
        onBlock={() => {
          setShowBlockModal(true)
          setShowActionMenu(false)
        }}
      />

      {/* Post Text */}
      {item.mediaType !== 'video' && <Text className="mb-3 text-sm leading-5 text-[#666666]">{item.body}</Text>}

      {/* Video Card */}
      {item.mediaType === 'video' && item.media ? (
        <View className="mb-3">
          <View className="h-[190px] overflow-hidden rounded-xl bg-black">
            <VideoView
              player={player}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              allowsPictureInPicture={false}
              pointerEvents="none"
            />
          </View>
          <Text className="mt-3 text-sm font-bold text-[#111111]">{item.title}</Text>
          <Text className="mt-1 text-sm leading-5 text-[#666666]">{item.body}</Text>
        </View>
      ) : null}

      {/* Image Card */}
      {item.mediaType === 'image' && item.media ? (
        <View className="mb-3 h-[250px] overflow-hidden rounded-xl bg-gray-100">
          <Image
            source={{ uri: item.media }}
            className="h-full w-full"
            resizeMode="cover"
          />
        </View>
      ) : null}

      {/* Action Bar */}
      <View className="flex-row items-center justify-between">
        {/* Left Side: Comment, Like, Repost */}
        <View className="flex-row items-center gap-6">
          <Pressable 
            className="flex-row items-center gap-2"
            onPress={(e) => {
              e.stopPropagation()
              handlePress()
            }}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#666666" />
            <Text className="text-sm font-semibold text-[#666666]">{formatCount(item.comments)}</Text>
          </Pressable>

          <Pressable 
            className="flex-row items-center gap-2" 
            onPress={(e) => {
              e.stopPropagation()
              // Fire and forget - don't await
              toggleLike(item.id, isLiked(item.id)).catch(err => console.warn('Like error:', err))
            }}
          >
            <Ionicons
              name={isLiked(item.id) ? 'heart' : 'heart-outline'}
              size={20}
              color={isLiked(item.id) ? '#f472b6' : '#666666'}
            />
            <Text className="text-sm font-semibold text-[#666666]">{formatCount(item.likes)}</Text>
          </Pressable>

          <Pressable 
            className="flex-row items-center gap-2" 
            onPress={(e) => {
              e.stopPropagation()
              toggleRepost(item.id, isReposted(item.id)).catch(err => console.warn('Repost error:', err))
            }}
          >
            <Ionicons 
              name="repeat" 
              size={20} 
              color={isReposted(item.id) ? '#007AFF' : '#666666'} 
            />
            <Text className={`text-sm font-semibold ${isReposted(item.id) ? 'text-[#007AFF]' : 'text-[#666666]'}`}>{formatCount(item.reposts || 0)}</Text>
          </Pressable>
        </View>

        {/* Right Side: Save */}
        <Pressable
          className={`flex-row items-center gap-2 rounded-2xl px-5 py-2 ${
            isSaved(item.id) ? 'bg-[#DCEBFF]' : ''
          }`}
          onPress={(e) => {
            e.stopPropagation()
            // Fire and forget - don't await
            toggleSave(item.id, isSaved(item.id)).catch(err => console.warn('Save error:', err))
          }}
        >
          <Ionicons
            name={isSaved(item.id) ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={isSaved(item.id) ? '#007AFF' : '#666666'}
          />
          <Text className={`text-sm font-semibold ${isSaved(item.id) ? 'text-[#007AFF]' : 'text-[#666666]'}`}>
            {formatCount(item.saves)}
          </Text>
        </Pressable>
      </View>
      </View>
    </Pressable>

    {/* Report Modal */}
    <ReportModal
      visible={showReportModal}
      contentId={item.id}
      contentType="post"
      onClose={() => setShowReportModal(false)}
    />

    {/* Block User Modal */}
    <BlockUserModal
      visible={showBlockModal}
      userId={item.authorId}
      userName={item.authorName}
      userAvatar={item.authorAvatar}
      isBlocked={false}
      onClose={() => setShowBlockModal(false)}
    />
    </>
  )
}

export default memo(PostCard)
