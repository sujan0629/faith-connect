import { View, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFeedStore } from '../../stores/feedStore'
import { useFollowStore } from '../../stores/followStore'
import { useEngagementStore } from '../../stores/engagementStore'
import { useAuthStore } from '../../stores/authStore'
import { useCommentStore } from '../../stores/commentStore'
import { PostDetail } from '../../components/Feed/PostDetail'
import { CommentsList } from '../../components/Feed/CommentsList'
import { CommentInput } from '../../components/Feed/CommentInput'
import { PostScreenHeader } from '../../components/Headers/PostScreenHeader'
import { ReportModal } from '../../components/Moderation/ReportModal'
import { BlockUserModal } from '../../components/Moderation/BlockUserModal'
import { useState, useEffect } from 'react'
import { postsApi } from '../../api/posts'
import { leadersApi } from '../../api/leaders'
import type { Post } from '../../stores/feedStore'
import type { Comment } from '../../stores/commentStore'
import Toast from 'react-native-toast-message'

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams()
  const { explore, following, toggleLike, toggleSave } = useFeedStore()
  const { setFollowingIds } = useFollowStore()
  const { setLikes, setSaves, setReposts, toggleLike: engagementToggleLike, toggleSave: engagementToggleSave } = useEngagementStore()
  const { commentsByPost, fetchComments, addComment, toggleCommentLike } = useCommentStore()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)

  const comments = commentsByPost[post?.id || ''] || []
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null)
  
  // Find the comment being replied to (could be a top-level comment or a nested reply)
  const findCommentById = (commentId: string, commentsList: Comment[] = comments): Comment | null => {
    for (const comment of commentsList) {
      if (comment.id === commentId) {
        return comment
      }
      // Check in nested replies
      if (comment.repliesData) {
        for (const reply of comment.repliesData) {
          if (reply.id === commentId) {
            return reply
          }
        }
      }
    }
    return null
  }
  
  const replyingToComment = replyingToCommentId ? findCommentById(replyingToCommentId) : null
  // Initialize follow store on mount
  useEffect(() => {
    const initializeFollowStore = async () => {
      try {
        const followingLeaders = await leadersApi.getFollowing()
        setFollowingIds(followingLeaders.map(l => l.id))
      } catch (err) {
        console.warn('Failed to initialize follow store:', err)
      }
    }
    initializeFollowStore()
  }, [setFollowingIds])
  
  useEffect(() => {
    const loadPost = async () => {
      try {
        // Only load if we don't already have a post
        if (post) {
          setLoading(false)
          return
        }
        
        setLoading(true)
        // First try to find from store
        const storedPost = [...explore, ...following].find((p) => p.id === id)
        if (storedPost) {
          setPost(storedPost)
          // Initialize engagement store with post state
          if (storedPost.isLiked) setLikes([storedPost.id])
          if (storedPost.isSaved) setSaves([storedPost.id])
          if (storedPost.isReposted) setReposts([storedPost.id])
          // Fetch following status from API
          if (storedPost.authorId) {
            try {
              const followingLeaders = await leadersApi.getFollowing()
              const isFollowingLeader = followingLeaders.some(l => l.id === storedPost.authorId)
              setIsFollowing(isFollowingLeader)
            } catch (err) {
              console.warn('Failed to fetch following status:', err)
            }
          }
          return
        }
        
        // If not in store, fetch from API
        if (id) {
          const postId = Array.isArray(id) ? id[0] : id
          const fetchedPost = await postsApi.getPost(postId)
          setPost(fetchedPost)
          // Initialize engagement store with post state
          if (fetchedPost.isLiked) setLikes([fetchedPost.id])
          if (fetchedPost.isSaved) setSaves([fetchedPost.id])
          if (fetchedPost.isReposted) setReposts([fetchedPost.id])
          // Fetch following status from API
          if (fetchedPost.authorId) {
            try {
              const followingLeaders = await leadersApi.getFollowing()
              const isFollowingLeader = followingLeaders.some(l => l.id === fetchedPost.authorId)
              setIsFollowing(isFollowingLeader)
            } catch (err) {
              console.warn('Failed to fetch following status:', err)
            }
          }
        }
      } catch (error) {
        console.error('Failed to load post:', error)
        Toast.show({
          type: 'error',
          text1: 'Failed to load post',
          text2: 'Please try again',
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadPost()
  }, [id])

  // Comments data
  useEffect(() => {
    if (!post?.id) return
    fetchComments(post.id)
  }, [post?.id, fetchComments])

  const handleLikeComment = async (commentId: string, postId: string) => {
    try {
      await toggleCommentLike(postId, commentId)
    } catch (error) {
      console.warn('Failed to like comment:', error)
    }
  }

  const handleAddComment = async (text: string) => {
    if (!post?.id || !text.trim()) return
    
    try {
      setIsSubmittingComment(true)
      
      if (replyingToCommentId) {
        // Add reply to comment
        await useCommentStore.getState().addReply(post.id, replyingToCommentId, text)
        setReplyingToCommentId(null) // Clear reply context
      } else {
        // Add regular comment
        await addComment(post.id, text)
      }
    } catch (error) {
      console.warn('Failed to add comment/reply:', error)
    } finally {
      setIsSubmittingComment(false)
    }
  }
  
  const handleReplyPress = (commentId: string) => {
    setReplyingToCommentId(commentId)
    // In a real app, you'd focus the input here
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#222" />
      </SafeAreaView>
    )
  }

  if (!post) {
    return <SafeAreaView className="flex-1 bg-white" />
  }

  const handleLike = () => {
    // Optimistic update
    setPost({
      ...post,
      isLiked: !post.isLiked,
      likes: post.isLiked ? post.likes - 1 : post.likes + 1,
    })
    // Fire and forget API call
    engagementToggleLike(post.id, post.isLiked).catch(err => {
      console.warn('Like error:', err)
      // Revert optimistic update on error
      setPost({
        ...post,
        isLiked: post.isLiked,
        likes: post.isLiked ? post.likes + 1 : post.likes - 1,
      })
    })
  }

  const handleSave = () => {
    // Optimistic update
    setPost({
      ...post,
      isSaved: !post.isSaved,
      saves: post.isSaved ? post.saves - 1 : post.saves + 1,
    })
    // Fire and forget API call
    engagementToggleSave(post.id, post.isSaved).catch(err => {
      console.warn('Save error:', err)
      // Revert optimistic update on error
      setPost({
        ...post,
        isSaved: post.isSaved,
        saves: post.isSaved ? post.saves + 1 : post.saves - 1,
      })
    })
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <PostScreenHeader 
        title={post.authorName}
        onReport={() => setShowReportModal(true)}
        onBlock={() => setShowBlockModal(true)}
      />
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView className="flex-1 bg-white">
          <PostDetail 
            post={post} 
            onLike={handleLike}
            onSave={handleSave}
            isFollowing={isFollowing}
            onFollowChange={setIsFollowing}
          />
          <View className="mt-4">
            <CommentsList 
              comments={comments}
              onLikeComment={handleLikeComment}
              postId={post?.id || ''}
              onReplyComment={handleReplyPress}
            />
          </View>
        </ScrollView>
        <CommentInput 
          onSubmit={handleAddComment} 
          isSubmitting={isSubmittingComment}
          replyingTo={replyingToComment}
          onCancelReply={() => setReplyingToCommentId(null)}
        />
      </KeyboardAvoidingView>

      <ReportModal
        visible={showReportModal}
        contentId={post?.id || ''}
        contentType="post"
        onClose={() => setShowReportModal(false)}
      />

      <BlockUserModal
        visible={showBlockModal}
        userId={post?.authorId || ''}
        userName={post?.authorName || ''}
        userAvatar={post?.authorAvatar}
        isBlocked={false}
        onClose={() => setShowBlockModal(false)}
      />
    </>
  )
}
