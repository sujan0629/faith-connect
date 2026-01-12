import { View, Text, Image, Pressable, TouchableOpacity } from 'react-native'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { Comment } from '../../stores/commentStore'
import { useState } from 'react'
import Toast from 'react-native-toast-message'
import { CommentActionModal } from './CommentActionModal'
import { ReportModal } from '../Moderation/ReportModal'
import { BlockUserModal } from '../Moderation/BlockUserModal'

interface Props {
  comment: Comment
  onLike: (commentId: string, postId: string) => void
  onReply?: (id: string) => void
  isReply?: boolean
  depth?: number
  postId: string
}

const maxDepth = 5

export const CommentItem = ({ comment, onLike, onReply, isReply = false, depth = 0, postId }: Props) => {
  const [hasLiked, setHasLiked] = useState(comment.isLiked)
  const [likesCount, setLikesCount] = useState(comment.likes)
  const [showReplies, setShowReplies] = useState(depth < maxDepth && comment.replies > 0)
  const [showActionMenu, setShowActionMenu] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)

  const handleLike = async () => {
    try {
      const newLikedState = !hasLiked
      setHasLiked(newLikedState)
      setLikesCount(newLikedState ? likesCount + 1 : likesCount - 1)
      
      // Call parent handler which will call API
      onLike(comment.id, postId)
    } catch (error) {
      console.warn('Failed to like comment:', error)
      Toast.show({
        type: 'error',
        text1: 'Failed to like comment',
      })
      // Revert state
      setHasLiked(!hasLiked)
      setLikesCount(hasLiked ? likesCount + 1 : likesCount - 1)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      // If dateString is empty or invalid, use a mock date (1 hour ago)
      const date = dateString ? new Date(dateString) : new Date(Date.now() - 3600000)
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return '1 hour ago' // Mock date
      }
      
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffHours = diffMs / (1000 * 60 * 60)
      const diffDays = diffMs / (1000 * 60 * 60 * 24)

      if (diffHours < 1) return 'now'
      if (diffHours < 24) return `${Math.floor(diffHours)}h`
      if (diffDays < 7) return `${Math.floor(diffDays)}d`
      return date.toLocaleDateString()
    } catch (error) {
      return '1h' // Fallback mock date
    }
  }

  return (
    <View 
      className={`py-4 gap-y-2 border-b border-[#e5e5e5] px-4 shrink-0 ${isReply ? 'pb-0 pr-0 border-b-0 border-l-2 border-gray-300' : ''}`}
      style={isReply ? { marginLeft: depth * 16 } : {}}
    >
      <View className="flex-row gap-x-2 items-center">
        <Pressable>
          {comment.authorAvatar ? (
            <Image
              source={{ uri: comment.authorAvatar }}
              className="h-10 w-10 rounded-full bg-gray-200"
            />
          ) : (
            <View className="h-10 w-10 rounded-full bg-gray-200" />
          )}
        </Pressable>
        <View className="flex-1">
          <Pressable>
            <Text className="text-gray-900 text-sm font-medium">{comment.authorName}</Text>
          </Pressable>
          <Text className="text-gray-400 text-xs">{formatDate(comment.createdAt)}</Text>
        </View>
        <Pressable onPress={() => setShowActionMenu(true)}>
          <MaterialIcons name="more-horiz" size={24} color="#666666" />
        </Pressable>
      </View>

      {/* CONTENT */}
      <Text className="text-sm mt-1 text-[#666666]">{comment.text}</Text>

      {/* BUTTONS */}
      <View className="flex-row mt-1 gap-x-4 items-center">
        <Pressable className="flex-row gap-x-1 items-center" onPress={handleLike}>
          <Ionicons
            name={hasLiked ? "heart" : "heart-outline"}
            size={15}
            color={hasLiked ? "#007AFF" : "#666666"}
          />
          <Text className="text-gray-500 text-xs">{likesCount}</Text>
        </Pressable>
        <TouchableOpacity
          onPress={() => onReply?.(comment.id)}
          className="flex-row gap-x-1 items-center"
        >
          <Ionicons name="return-up-back-outline" size={15} color="#666666" />
        </TouchableOpacity>
        {comment.replies > 0 && (
          <TouchableOpacity
            className="items-center justify-center"
            onPress={() => setShowReplies(!showReplies)}
          >
            <Text className={`text-xs font-medium ${showReplies ? 'text-gray-500' : 'text-gray-600'}`}>
              {showReplies ? `Hide ${comment.replies} ${comment.replies === 1 ? 'Reply' : 'Replies'}` : `View ${comment.replies} ${comment.replies === 1 ? 'Reply' : 'Replies'}`}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Nested replies */}
      {comment.repliesData && comment.repliesData.length > 0 && showReplies && (
        <View>
          {comment.repliesData.map((reply: any) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onLike={onLike}
              onReply={onReply}
              isReply={true}
              depth={depth + 1}
              postId={postId}
            />
          ))}
        </View>
      )}

      {/* Action Modals */}
      <CommentActionModal
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

      <ReportModal
        visible={showReportModal}
        contentId={postId}
        contentType="post"
        onClose={() => setShowReportModal(false)}
      />

      <BlockUserModal
        visible={showBlockModal}
        userId={comment.authorId}
        userName={comment.authorName}
        userAvatar={comment.authorAvatar}
        isBlocked={false}
        onClose={() => setShowBlockModal(false)}
      />
    </View>
  )
}
