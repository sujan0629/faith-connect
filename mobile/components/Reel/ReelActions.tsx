import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useState, useEffect } from 'react'
import { CommentsModal } from './CommentsModal'
import { Comment , useCommentStore } from '../../stores/commentStore'
import { useEngagementStore } from '../../stores/engagementStore'

import { ReelActionModal } from './ReelActionModal'
import { ReportModal } from '../Moderation/ReportModal'
import { BlockUserModal } from '../Moderation/BlockUserModal'

interface Reel {
  id: string
  likes: number
  isLiked?: boolean
  comments: number
  saves: number
  isSaved?: boolean
  reposts: number
  isReposted?: boolean
}

interface ReelActionsProps {
  reel: Reel
  onLikePress: (reelId: string) => void
  onSavePress: (reelId: string) => void
  onCommentPress?: (reelId: string) => void
  comments?: Comment[]
  onLikeComment?: (commentId: string) => void
  onAddComment?: (text: string) => void
  onSharePress?: () => void
  onMorePress?: () => void
  authorId?: string
  authorName?: string
  authorAvatar?: string
}

const formatCount = (num: number) => {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export const ReelActions = ({
  reel,
  onLikePress,
  onSavePress,
  onCommentPress,
  comments = [],
  onLikeComment,
  onAddComment,
  onSharePress,
  onMorePress,
  authorId = '',
  authorName = '',
  authorAvatar = '',
}: ReelActionsProps) => {
  const [showCommentsModal, setShowCommentsModal] = useState(false)
  const [showActionMenu, setShowActionMenu] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [localLikes, setLocalLikes] = useState(reel.likes)
  const [localSaves, setLocalSaves] = useState(reel.saves)
  const [localReposts, setLocalReposts] = useState(reel.reposts || 0)
  const { isLiked, isSaved, isReposted, toggleLike, toggleSave, toggleRepost } = useEngagementStore()

  // Sync local state when reel prop changes (from feed store updates)
  useEffect(() => {
    setLocalLikes(reel.likes)
    setLocalSaves(reel.saves)
    setLocalReposts(reel.reposts || 0)
  }, [reel.likes, reel.saves, reel.reposts])

  const handleCommentPress = () => {
    if (onCommentPress) {
      onCommentPress(reel.id)
    }
    // Ensure comments are loaded into store for modal
    try {
      useCommentStore.getState().fetchComments(reel.id).catch(() => {})
    } catch {}
    setShowCommentsModal(true)
  }

  const handleCloseComments = () => {
    setShowCommentsModal(false)
  }

  const handleAddComment = (text: string) => {
    if (onAddComment) {
      onAddComment(text)
    }
  }

  const handleLikeComment = (commentId: string) => {
    if (onLikeComment) {
      onLikeComment(commentId)
    }
  }
  return (
    <>
      <View className="absolute right-4 bottom-0 gap-6 items-center">
        {/* Like Button */}
        <Pressable onPress={() => {
          const wasLiked = isLiked(reel.id)
          setLocalLikes(wasLiked ? localLikes - 1 : localLikes + 1)
          toggleLike(reel.id, wasLiked).catch(err => {
            console.warn('Like error:', err)
            setLocalLikes(wasLiked ? localLikes + 1 : localLikes - 1)
          })
        }} className="items-center">
          <Ionicons
            name={isLiked(reel.id) ? 'heart' : 'heart-outline'}
            size={32}
            color={isLiked(reel.id) ? '#FF3B5C' : 'white'}
          />
          <Text className="text-white text-xs font-semibold mt-1">{formatCount(localLikes)}</Text>
        </Pressable>

        {/* Comment Button */}
        <Pressable onPress={handleCommentPress} className="items-center">
          <Ionicons name="chatbubble-outline" size={30} color="white" />
          <Text className="text-white text-xs font-semibold mt-1">{formatCount(reel.comments)}</Text>
        </Pressable>

        {/* Save Button */}
        <Pressable onPress={() => {
          const wasSaved = isSaved(reel.id)
          setLocalSaves(wasSaved ? localSaves - 1 : localSaves + 1)
          toggleSave(reel.id, wasSaved).catch(err => {
            console.warn('Save error:', err)
            setLocalSaves(wasSaved ? localSaves + 1 : localSaves - 1)
          })
        }} className="items-center">
          <Ionicons
            name={isSaved(reel.id) ? 'bookmark' : 'bookmark-outline'}
            size={30}
            color="white"
          />
          <Text className="text-white text-xs font-semibold mt-1">{formatCount(localSaves)}</Text>
        </Pressable>

        {/* Repost Button */}
        <Pressable onPress={() => {
          const wasReposted = isReposted(reel.id)
          setLocalReposts(wasReposted ? localReposts - 1 : localReposts + 1)
          toggleRepost(reel.id, wasReposted).catch(err => {
            console.warn('Repost error:', err)
            setLocalReposts(wasReposted ? localReposts + 1 : localReposts - 1)
          })
        }} className="items-center">
          <Ionicons 
            name="repeat" 
            size={30} 
            color={isReposted(reel.id) ? 'white' : 'white'} 
          />
          <Text className={`text-xs font-semibold mt-1 ${isReposted(reel.id) ? 'text-white' : 'text-white'}`}>{formatCount(localReposts)}</Text>
        </Pressable>

        {/* More Options */}
        <Pressable onPress={() => setShowActionMenu(true)} className="items-center">
          <Ionicons name="ellipsis-horizontal" size={28} color="white" />
        </Pressable>
      </View>

      <CommentsModal
        visible={showCommentsModal}
        onClose={handleCloseComments}
        comments={comments}
        onLikeComment={handleLikeComment}
        onAddComment={handleAddComment}
        reelId={reel.id}
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

      {/* Report Modal */}
      <ReportModal
        visible={showReportModal}
        contentId={reel.id}
        contentType="reel"
        onClose={() => setShowReportModal(false)}
      />

      {/* Block User Modal */}
      <BlockUserModal
        visible={showBlockModal}
        userId={authorId}
        userName={authorName}
        userAvatar={authorAvatar}
        isBlocked={false}
        onClose={() => setShowBlockModal(false)}
      />
    </>
  )
}
