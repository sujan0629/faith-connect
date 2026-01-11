import React, { useState } from 'react'
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Comment } from '../../app/posts/[id]'
import { KeyboardStickyView } from 'react-native-keyboard-controller' // Import this
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface CommentsModalProps {
  visible: boolean
  onClose: () => void
  comments: Comment[]
  onLikeComment: (commentId: string) => void
  onAddComment: (text: string) => void
  reelId: string
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  visible,
  onClose,
  comments,
  onLikeComment,
  onAddComment,
  reelId,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [commentText, setCommentText] = useState('')
  const insets = useSafeAreaInsets()

  const handleAddComment = async () => {
    if (!commentText.trim()) return
    
    setIsSubmitting(true)
    try {
      await onAddComment(commentText.trim())
      setCommentText('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCount = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    try {
      const date = dateString ? new Date(dateString) : new Date(Date.now() - 3600000)
      if (isNaN(date.getTime())) return '1h'
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffHours = diffMs / (1000 * 60 * 60)
      const diffDays = diffMs / (1000 * 60 * 60 * 24)
      if (diffHours < 1) return 'now'
      if (diffHours < 24) return `${Math.floor(diffHours)}h`
      if (diffDays < 7) return `${Math.floor(diffDays)}d`
      return date.toLocaleDateString()
    } catch {
      return '1h'
    }
  }

  const CommentItem = ({ comment }: { comment: Comment }) => (
    <Pressable 
      className="flex-row items-start py-4 px-4"
      onPress={(e) => e.stopPropagation()}
    >
      <Image
        source={{ uri: comment.authorAvatar || 'https://via.placeholder.com/40' }}
        className="w-8 h-8 rounded-full mr-3"
      />
      <View className="flex-1 ml-3">
        <View className="flex-row items-center mb-1">
          <Text className="font-semibold text-sm text-gray-900 mr-2">
            {comment.authorName}
          </Text>
          <Text className="text-xs text-gray-500">
            {formatDate(comment.createdAt)}
          </Text>
        </View>
        <Text className="text-sm text-gray-800 leading-5">
          {comment.text}
        </Text>
      </View>
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          onLikeComment(comment.id);
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        className="ml-2 p-1"
      >
        <Ionicons
          name={comment.isLiked ? 'heart' : 'heart-outline'}
          size={16}
          color={comment.isLiked ? '#FF3B5C' : '#666'}
        />
        {comment.likes > 0 && (
          <Text className="text-xs text-gray-500 text-center mt-1">
            {formatCount(comment.likes)}
          </Text>
        )}
      </Pressable>
    </Pressable>
  )

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 justify-end" onPress={onClose}>
        <Pressable 
          className="bg-white rounded-3xl overflow-hidden" 
          style={{ height: '60%' }}
          onPress={(e) => e.stopPropagation()} 
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
            <Text className="text-lg font-semibold text-gray-900">
              Comments ({comments.length})
            </Text>
            <Pressable onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#666" />
            </Pressable>
          </View>

          {/* Comments List */}
          <ScrollView 
             className="flex-1 bg-white" 
             showsVerticalScrollIndicator={false}
             keyboardShouldPersistTaps="handled"
          >
            {comments.length === 0 ? (
              <View className="flex-1 items-center justify-center py-12">
                <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
                <Text className="text-gray-500 text-center mt-4 px-8">
                  No comments yet. Be the first to comment!
                </Text>
              </View>
            ) : (
              comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))
            )}
          </ScrollView>

          {/* Fixed Footer using StickyView */}
          <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
            <View 
              className="border-t border-gray-200 px-4 py-3 bg-white"
              style={{ paddingBottom: Math.max(insets.bottom, 12) }}
            >
              <View className="flex-row rounded-3xl bg-[#f5f5f5] px-4 py-3 items-end">
            <TextInput
              className="flex-1 text-sm text-[#111111]"
              placeholder="Type comment"
              placeholderTextColor="#999999"
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
              style={{ textAlignVertical: 'center', minHeight: 30 }}
            />
            
            <Pressable 
              onPress={handleAddComment}
              className={`rounded-full ml-2 p-2 ${commentText.trim() ? 'bg-black' : 'bg-transparent'}`}
            >
              <Ionicons 
                name="send" 
                size={16} 
                color={commentText.trim() ? "white" : "#999999"} 
              />
            </Pressable>
          </View>
            </View>
          </KeyboardStickyView>
        </Pressable>
      </Pressable>
    </Modal>
  )
}