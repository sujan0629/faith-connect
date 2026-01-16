import { View, Text, Pressable, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Post } from '../../stores/feedStore'
import { VideoView, useVideoPlayer } from 'expo-video'
import { useState, useEffect, memo } from 'react'
import { useRouter } from 'expo-router'
import { useEngagementStore } from '../../stores/engagementStore'
import { postsApi } from '../../api/posts'
import { ReportModal } from '../Moderation/ReportModal'
import { BlockUserModal } from '../Moderation/BlockUserModal'
import { ReelActionModal } from './ReelActionModal'

interface Props {
  item: Post
  onLike: (id: string) => void
  onSave: (id: string) => void
  isVisible?: boolean
  isScreenFocused?: boolean
  isProfileView?: boolean
  defaultMuted?: boolean
}

const formatCount = (num: number) => {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

// Global mute state for all reels
let globalMuted = false

const ReelCard = ({ item, onLike, onSave, isVisible = true, isScreenFocused = true, isProfileView = false, defaultMuted = false }: Props) => {
  const initialMuted = isProfileView ? true : defaultMuted
  const [localMuted, setLocalMuted] = useState(initialMuted)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [showActionMenu, setShowActionMenu] = useState(false)
  const router = useRouter()
  const { isLiked, isSaved, isReposted, toggleLike, toggleSave, toggleRepost } = useEngagementStore()

  const player = useVideoPlayer(item.media || '', player => {
    player.loop = true
    player.muted = isProfileView ? true : globalMuted
    if (isVisible && isScreenFocused) {
      player.play()
    }
  })

  // Handle mute/unmute globally (but not in profile view)
   
  useEffect(() => {
    if (!isProfileView) {
      player.muted = globalMuted
      setLocalMuted(globalMuted)
    }
  }, [globalMuted, player, isProfileView])

  // Handle play/pause based on visibility and screen focus
  useEffect(() => {
    if (isVisible && isScreenFocused) {
      player.play()
    } else {
      player.pause()
    }
  }, [isVisible, isScreenFocused, player])

  // Track watch time when reel is visible and playing
  useEffect(() => {
    if (!isVisible || !isScreenFocused || isProfileView) return

    let watchTimeTracker: NodeJS.Timeout
    let accumulatedTime = 0

    const trackWatchTime = async () => {
      accumulatedTime += 0.5 // Track every 500ms
      
      // Send to backend every 2 seconds or when watch completes
      if (accumulatedTime % 2 === 0 || (item.videoDuration && accumulatedTime >= item.videoDuration)) {
        try {
          await postsApi.trackWatch(item.id, accumulatedTime, item.videoDuration || 60)
        } catch {
          // Handle tracking error silently
        }
      }
    }

    watchTimeTracker = setInterval(trackWatchTime, 500)

    return () => {
      clearInterval(watchTimeTracker)
    }
  }, [isVisible, isScreenFocused, isProfileView, item.id, item.videoDuration])

  // Cleanup player on unmount
  useEffect(() => {
    return () => {
      try {
        player.pause()
        player.release?.()
      } catch {
        // Player might already be released
      }
    }
  }, [player])

  const toggleMute = () => {
    globalMuted = !globalMuted
    setLocalMuted(globalMuted)
    player.muted = globalMuted
    // Just mute - don't pause
  }

  if (isProfileView) {
    return (
      <Pressable onPress={() => router.push({ pathname: '/reels', params: { reelId: item.id } })}>
        <View className="bg-white pb-3">
          {/* Video */}
          {(item.mediaType === 'video' || item.mediaType === 'reel') && item.media ? (
            <View className="h-[250px] overflow-hidden rounded-xl bg-black relative">
              <VideoView
                player={player}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                allowsPictureInPicture={false}
                nativeControls={false}
                pointerEvents="none"
              />
              
              {/* Mute/Unmute Button */}
              <Pressable
                onPress={() => {
                  toggleMute()
                }}
                className="absolute bottom-4 right-4 bg-black/50 rounded-full p-2"
              >
                <Ionicons
                  name={localMuted ? "volume-mute" : "volume-high"}
                  size={15}
                  color="white"
                />
              </Pressable>
            </View>
          ) : null}
        </View>
      </Pressable>
    )
  }

  return (
    <>
    <View className="border-b border-[#f0f0f0] bg-white px-5 pb-5 pt-4">
      {/* Header */}
      <View className="mb-2.5 flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center gap-2.5">
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
            <View className="flex-row items-center gap-1">
              <Ionicons name="musical-notes" size={10} color="#999999" />
              <Text className="text-xs text-[#999999]">{item.authorName} · Original audio</Text>
            </View>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-xs text-[#999999]">1 hour ago</Text>
          <Pressable onPress={() => setShowActionMenu(true)}>
            <Text className="text-base font-bold text-[#999999]">•••</Text>
          </Pressable>
        </View>
      </View>

      {/* Video */}
      {(item.mediaType === 'video' || item.mediaType === 'reel') && item.media ? (
        <View className="mb-3">
          <Pressable onPress={() => router.push({ pathname: '/reels', params: { reelId: item.id } })} className="h-[620px] overflow-hidden rounded-xl bg-black relative">
            <VideoView
              player={player}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              allowsPictureInPicture={false}
              nativeControls={false}
              pointerEvents="none"
            />
            
            {/* Mute/Unmute Button */}
            <Pressable
              onPress={toggleMute}
              className="absolute bottom-4 right-4 bg-black/50 rounded-full p-2"
            >
              <Ionicons
                name={localMuted ? "volume-mute" : "volume-high"}
                size={15}
                color="white"
              />
            </Pressable>
          </Pressable>
          {item.title && <Text className="mt-3 text-sm font-bold text-[#111111]">{item.title}</Text>}
          <Text className="mt-1 text-sm leading-5 text-[#666666]">{item.body}</Text>
        </View>
      ) : null}

      {/* Action Bar */}
      <View className="flex-row items-center justify-between">
        {/* Left Side: Comment, Like, Repost */}
        <View className="flex-row items-center gap-6">
          <Pressable className="flex-row items-center gap-2">
            <Ionicons name="chatbubble-outline" size={20} color="#666666" />
            <Text className="text-sm font-semibold text-[#666666]">{formatCount(item.comments)}</Text>
          </Pressable>

          <Pressable className="flex-row items-center gap-2" onPress={() => {
            toggleLike(item.id, isLiked(item.id)).catch(err => console.warn('Like error:', err))
          }}>
            <Ionicons
              name={isLiked(item.id) ? 'heart' : 'heart-outline'}
              size={20}
              color={isLiked(item.id) ? '#f472b6' : '#666666'}
            />
            <Text className={`text-sm font-semibold ${isLiked(item.id) ? 'text-[#f472b6]' : 'text-[#666666]'}`}>{formatCount(item.likes)}</Text>
          </Pressable>

          <Pressable className="flex-row items-center gap-2" onPress={() => {
            toggleRepost(item.id, isReposted(item.id)).catch(err => console.warn('Repost error:', err))
          }}>
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
          onPress={() => {
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

    {/* Report Modal */}
    <ReportModal
      visible={showReportModal}
      contentId={item.id}
      contentType="reel"
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

    {/* Action Menu Modal */}
    <ReelActionModal
      visible={showActionMenu}
      onClose={() => setShowActionMenu(false)}
      onReport={() => {
        setShowActionMenu(false)
        setShowReportModal(true)
      }}
      onBlock={() => {
        setShowActionMenu(false)
        setShowBlockModal(true)
      }}
    />
    </>
  )
}

export default memo(ReelCard)
