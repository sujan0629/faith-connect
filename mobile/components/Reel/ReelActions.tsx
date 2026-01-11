import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { CommentsModal } from './CommentsModal'
import { Comment } from '../../app/posts/[id]'

interface Reel {
  id: string
  likes: number
  isLiked?: boolean
  comments: number
  saves: number
  isSaved?: boolean
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
}: ReelActionsProps) => {
  const [showCommentsModal, setShowCommentsModal] = useState(false)

  const handleCommentPress = () => {
    if (onCommentPress) {
      onCommentPress(reel.id)
    }
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
        <Pressable onPress={() => onLikePress(reel.id)} className="items-center">
          <Ionicons
            name={reel.isLiked ? 'heart' : 'heart-outline'}
            size={32}
            color={reel.isLiked ? '#FF3B5C' : 'white'}
          />
          <Text className="text-white text-xs font-semibold mt-1">{formatCount(reel.likes)}</Text>
        </Pressable>

        {/* Comment Button */}
        <Pressable onPress={handleCommentPress} className="items-center">
          <Ionicons name="chatbubble-outline" size={30} color="white" />
          <Text className="text-white text-xs font-semibold mt-1">{formatCount(reel.comments)}</Text>
        </Pressable>

        {/* Save Button */}
        <Pressable onPress={() => onSavePress(reel.id)} className="items-center">
          <Ionicons
            name={reel.isSaved ? 'bookmark' : 'bookmark-outline'}
            size={30}
            color="white"
          />
          <Text className="text-white text-xs font-semibold mt-1">{formatCount(reel.saves)}</Text>
        </Pressable>

        {/* Share Button */}
        <Pressable onPress={onSharePress} className="items-center">
          <Ionicons name="repeat" size={30} color="white" />
          <Text className="text-white text-xs font-semibold mt-1">7000</Text>
        </Pressable>

        {/* More Options */}
        <Pressable onPress={onMorePress} className="items-center">
          <Ionicons name="ellipsis-horizontal" size={30} color="white" />
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
    </>
  )
}
