import { create } from 'zustand'
import { postsApi } from '../api/posts'
import { useEngagementStore } from './engagementStore'
import { useAuthStore } from './authStore'
import Toast from 'react-native-toast-message'

export interface Comment {
  id: string
  authorId: string
  authorName: string
  authorAvatar?: string
  text: string
  likes: number
  isLiked: boolean
  replies: number
  repliesData?: Comment[]
  createdAt: string
}

interface CommentStoreState {
  // Store comments by postId
  commentsByPost: Record<string, Comment[]>
  
  // Store replies by commentId
  repliesByCommentId: Record<string, Comment[]>
  
  // Submission state for comments/replies
  isSubmitting: boolean
  setIsSubmitting: (v: boolean) => void
  
  // Fetch comments for a post
  fetchComments: (postId: string) => Promise<void>
  
  // Add a new comment
  addComment: (postId: string, text: string) => Promise<void>
  
  // Like/unlike a comment
  toggleCommentLike: (postId: string, commentId: string) => Promise<void>
  
  // Add reply to comment
  addReply: (postId: string, commentId: string, text: string) => Promise<void>
  
  // Like/unlike a reply
  toggleReplyLike: (postId: string, commentId: string, replyId: string) => Promise<void>
  
  // Clear comments for a post
  clearPostComments: (postId: string) => void
  
  // Clear all comments
  clearAll: () => void
}

export const useCommentStore = create<CommentStoreState>((set, get) => ({
  commentsByPost: {},
  repliesByCommentId: {},
  isSubmitting: false,
  setIsSubmitting: (v: boolean) => set({ isSubmitting: v }),

  fetchComments: async (postId: string) => {
    try {
      const current = get().commentsByPost
      
      // If already loaded, don't refetch
      if (current[postId]) {
        return
      }
      
      // Fetch comments from API
      const comments = await postsApi.getComments(postId)
      set({ 
        commentsByPost: { 
          ...current, 
          [postId]: comments || [] 
        } 
      })
    } catch (error) {
      console.warn('Failed to fetch comments:', error)
      // Initialize with empty array on error
      const current = get().commentsByPost
      if (!current[postId]) {
        set({
          commentsByPost: {
            ...current,
            [postId]: [],
          },
        })
      }
      Toast.show({
        type: 'error',
        text1: 'Failed to load comments',
      })
    }
  },

  addComment: async (postId: string, text: string) => {
    const user = useAuthStore.getState().user
    // mark submitting globally
    get().setIsSubmitting(true)
    
    if (!text.trim()) {
      get().setIsSubmitting(false)
      throw new Error('Comment text is required')
    }

    try {
      // Create optimistic comment
      const optimisticComment: Comment = {
        id: `c${Date.now()}`,
        authorId: user?.id || 'current-user',
        authorName: user?.name || 'You',
        authorAvatar: user?.avatar,
        text,
        likes: 0,
        isLiked: false,
        replies: 0,
        createdAt: new Date().toISOString(),
      }

      // Add optimistically
      const current = get().commentsByPost
      const postComments = current[postId] || []
      set({
        commentsByPost: {
          ...current,
          [postId]: [...postComments, optimisticComment],
        },
      })

      // Send to API via engagement store so feed counts update consistently
      await useEngagementStore.getState().addComment(postId, text)

      Toast.show({
        type: 'success',
        text1: 'Comment posted!',
      })
    } catch (error: any) {
      console.warn('Failed to add comment:', error)
      
      // Revert optimistic update
      const current = get().commentsByPost
      const postComments = current[postId] || []
      set({
        commentsByPost: {
          ...current,
          [postId]: postComments.slice(0, -1), // Remove last added comment
        },
      })

      Toast.show({
        type: 'error',
        text1: 'Failed to post comment',
        text2: error?.response?.data?.message || 'Please try again',
      })
      throw error
    } finally {
      get().setIsSubmitting(false)
    }
  },

  toggleCommentLike: async (postId: string, commentId: string) => {
    try {
      const current = get().commentsByPost
      const postComments = current[postId] || []

      // Find and update comment optimistically
      const updatedComments = postComments.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            isLiked: !c.isLiked,
            likes: c.isLiked ? c.likes - 1 : c.likes + 1,
          }
        }
        return c
      })

      set({
        commentsByPost: {
          ...current,
          [postId]: updatedComments,
        },
      })

      // If this is an optimistic-only comment (local id), skip calling backend
      // Optimistic IDs are prefixed with 'c' or 'r' (created client-side)
      if (commentId.startsWith('c') || commentId.startsWith('r')) {
        return
      }

      // Call API
      await postsApi.toggleCommentLike(postId, commentId)
    } catch (error: any) {
      console.warn('Failed to like comment:', error)
      
      Toast.show({
        type: 'error',
        text1: 'Failed to like comment',
      })
      
      // Revert by refetching
      await get().fetchComments(postId)
      throw error
    }
  },

  addReply: async (postId: string, commentId: string, text: string) => {
    const user = useAuthStore.getState().user

    // mark submitting globally
    get().setIsSubmitting(true)

    if (!text.trim()) {
      throw new Error('Reply text is required')
    }

    try {
      // Create optimistic reply
      const optimisticReply: Comment = {
        id: `r${Date.now()}`,
        authorId: user?.id || 'current-user',
        authorName: user?.name || 'You',
        authorAvatar: user?.avatar,
        text,
        likes: 0,
        isLiked: false,
        replies: 0,
        createdAt: new Date().toISOString(),
      }

      // Add optimistically to both locations for persistence
      const current = get().commentsByPost
      const currentReplies = get().repliesByCommentId
      const postComments = current[postId] || []
      
      // Update commentsByPost with the reply in repliesData
      const updatedComments = postComments.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            replies: c.replies + 1,
            repliesData: [...(c.repliesData || []), optimisticReply],
          }
        }
        return c
      })

      // Also store in repliesByCommentId for better persistence
      const commentReplies = currentReplies[commentId] || []

      set({
        commentsByPost: {
          ...current,
          [postId]: updatedComments,
        },
        repliesByCommentId: {
          ...currentReplies,
          [commentId]: [...commentReplies, optimisticReply],
        },
      })

      // Send to API
      await postsApi.addReplyToComment(postId, commentId, text)

      Toast.show({
        type: 'success',
        text1: 'Reply posted!',
      })
    } catch (error: any) {
      console.warn('Failed to add reply:', error)
      
      // Revert optimistic update
      const current = get().commentsByPost
      const postComments = current[postId] || []
      
      const revertedComments = postComments.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            replies: c.replies - 1,
            repliesData: (c.repliesData || []).slice(0, -1),
          }
        }
        return c
      })

      set({
        commentsByPost: {
          ...current,
          [postId]: revertedComments,
        },
      })

      Toast.show({
        type: 'error',
        text1: 'Failed to post reply',
        text2: error?.response?.data?.message || 'Please try again',
      })
      throw error
    } finally {
      get().setIsSubmitting(false)
    }
  },

  toggleReplyLike: async (postId: string, commentId: string, replyId: string) => {
    try {
      const current = get().commentsByPost
      const currentReplies = get().repliesByCommentId
      const postComments = current[postId] || []
      const commentReplies = currentReplies[commentId] || []

      // Find and update reply optimistically in commentsByPost
      const updatedComments = postComments.map((c) => {
        if (c.id === commentId && c.repliesData) {
          return {
            ...c,
            repliesData: c.repliesData.map((r) => {
              if (r.id === replyId) {
                return {
                  ...r,
                  isLiked: !r.isLiked,
                  likes: r.isLiked ? r.likes - 1 : r.likes + 1,
                }
              }
              return r
            }),
          }
        }
        return c
      })

      // Also update in repliesByCommentId for consistency
      const updatedReplies = commentReplies.map((r) => {
        if (r.id === replyId) {
          return {
            ...r,
            isLiked: !r.isLiked,
            likes: r.isLiked ? r.likes - 1 : r.likes + 1,
          }
        }
        return r
      })

      set({
        commentsByPost: {
          ...current,
          [postId]: updatedComments,
        },
        repliesByCommentId: {
          ...currentReplies,
          [commentId]: updatedReplies,
        },
      })

      // Call API
      await postsApi.toggleReplyLike(postId, commentId, replyId)
    } catch (error: any) {
      console.warn('Failed to like reply:', error)
      
      Toast.show({
        type: 'error',
        text1: 'Failed to like reply',
      })
      
      // Revert by refetching
      await get().fetchComments(postId)
      throw error
    }
  },

  clearPostComments: (postId: string) => {
    const current = get().commentsByPost
    const { [postId]: _, ...rest } = current
    set({ commentsByPost: rest })
  },

  clearAll: () => {
    set({ 
      commentsByPost: {},
      repliesByCommentId: {},
    })
  },
}))
