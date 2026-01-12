import { create } from 'zustand'
import { postsApi } from '../api/posts'
import { useFeedStore } from './feedStore'
import { useNotificationStore } from './notificationStore'
import Toast from 'react-native-toast-message'

interface EngagementStore {
  likes: Set<string>
  saves: Set<string>
  reposts: Set<string>

  addLike: (postId: string) => Promise<void>
  removeLike: (postId: string) => Promise<void>
  toggleLike: (postId: string, isCurrentlyLiked: boolean) => Promise<void>

  addSave: (postId: string) => Promise<void>
  removeSave: (postId: string) => Promise<void>
  toggleSave: (postId: string, isCurrentlySaved: boolean) => Promise<void>

  addRepost: (postId: string) => Promise<void>
  removeRepost: (postId: string) => Promise<void>
  toggleRepost: (postId: string, isCurrentlyReposted: boolean) => Promise<void>

  addComment: (postId: string, text: string) => Promise<void>

  addReplyToComment: (postId: string, commentId: string, text: string) => Promise<void>

  toggleCommentLike: (postId: string, commentId: string) => Promise<void>

  toggleReplyLike: (postId: string, commentId: string, replyId: string) => Promise<void>

  isLiked: (postId: string) => boolean
  isSaved: (postId: string) => boolean
  isReposted: (postId: string) => boolean

  setLikes: (postIds: string[]) => void
  setSaves: (postIds: string[]) => void
  setReposts: (postIds: string[]) => void

  clearEngagements: () => void
}

export const useEngagementStore = create<EngagementStore>((set, get) => ({
  likes: new Set(),
  saves: new Set(),
  reposts: new Set(),

  setLikes: (postIds: string[]) => {
    set({ likes: new Set(postIds) })
  },

  setSaves: (postIds: string[]) => {
    set({ saves: new Set(postIds) })
  },

  setReposts: (postIds: string[]) => {
    set({ reposts: new Set(postIds) })
  },

  toggleLike: async (postId: string, isCurrentlyLiked: boolean) => {
    try {
      if (isCurrentlyLiked) {
        await get().removeLike(postId)
      } else {
        await get().addLike(postId)
      }
    } catch (error: any) {
      console.error('Toggle like error:', error)
      Toast.show({
        type: 'error',
        text1: 'Failed to update like',
        text2: error?.response?.data?.message || 'Please try again',
      })
    }
  },

  addLike: async (postId: string) => {
    try {
      const current = get().likes
      set({ likes: new Set([...current, postId]) })
      const response = await postsApi.toggleLike(postId)
      // Update feedStore with the new like count
      useFeedStore.getState().updatePost(postId, {
        likes: response.likes,
        isLiked: response.isLiked,
      })
      // Refresh notifications after liking
      useNotificationStore.getState().fetchNotifications().catch(() => {})
    } catch (error: any) {
      const current = get().likes
      current.delete(postId)
      set({ likes: new Set(current) })
      throw error
    }
  },

  removeLike: async (postId: string) => {
    try {
      const current = get().likes
      const updated = new Set(current)
      updated.delete(postId)
      set({ likes: updated })
      const response = await postsApi.toggleLike(postId)
      // Update feedStore with the new like count
      useFeedStore.getState().updatePost(postId, {
        likes: response.likes,
        isLiked: response.isLiked,
      })
    } catch (error: any) {
      const current = get().likes
      set({ likes: new Set([...current, postId]) })
      throw error
    }
  },

  toggleSave: async (postId: string, isCurrentlySaved: boolean) => {
    try {
      if (isCurrentlySaved) {
        await get().removeSave(postId)
      } else {
        await get().addSave(postId)
      }
    } catch (error: any) {
      console.error('Toggle save error:', error)
      Toast.show({
        type: 'error',
        text1: 'Failed to update save',
        text2: error?.response?.data?.message || 'Please try again',
      })
    }
  },

  addSave: async (postId: string) => {
    try {
      const current = get().saves
      set({ saves: new Set([...current, postId]) })
      const response = await postsApi.toggleSave(postId)
      // Update feedStore with the new save count
      useFeedStore.getState().updatePost(postId, {
        saves: response.saves,
        isSaved: response.isSaved,
      })
    } catch (error: any) {
      const current = get().saves
      current.delete(postId)
      set({ saves: new Set(current) })
      throw error
    }
  },

  removeSave: async (postId: string) => {
    try {
      const current = get().saves
      const updated = new Set(current)
      updated.delete(postId)
      set({ saves: updated })
      const response = await postsApi.toggleSave(postId)
      // Update feedStore with the new save count
      useFeedStore.getState().updatePost(postId, {
        saves: response.saves,
        isSaved: response.isSaved,
      })
    } catch (error: any) {
      const current = get().saves
      set({ saves: new Set([...current, postId]) })
      throw error
    }
  },

  toggleRepost: async (postId: string, isCurrentlyReposted: boolean) => {
    try {
      if (isCurrentlyReposted) {
        await get().removeRepost(postId)
      } else {
        await get().addRepost(postId)
      }
    } catch (error: any) {
      console.error('Toggle repost error:', error)
      Toast.show({
        type: 'error',
        text1: 'Failed to update repost',
        text2: error?.response?.data?.message || 'Please try again',
      })
    }
  },

  addRepost: async (postId: string) => {
    try {
      const current = get().reposts
      set({ reposts: new Set([...current, postId]) })
      const response = await postsApi.toggleRepost(postId)
      // Update feedStore with the new repost count
      useFeedStore.getState().updatePost(postId, {
        reposts: response.reposts,
        isReposted: response.isReposted,
      })
      // Refresh notifications after reposting
      useNotificationStore.getState().fetchNotifications().catch(() => {})
      Toast.show({
        type: 'success',
        text1: 'Reposted!',
        text2: 'Added to your reposts',
      })
    } catch (error: any) {
      const current = get().reposts
      current.delete(postId)
      set({ reposts: new Set(current) })
      throw error
    }
  },

  removeRepost: async (postId: string) => {
    try {
      const current = get().reposts
      const updated = new Set(current)
      updated.delete(postId)
      set({ reposts: updated })
      const response = await postsApi.toggleRepost(postId)
      // Update feedStore with the new repost count
      useFeedStore.getState().updatePost(postId, {
        reposts: response.reposts,
        isReposted: response.isReposted,
      })
      Toast.show({
        type: 'success',
        text1: 'Repost removed',
        text2: 'Removed from your reposts',
      })
    } catch (error: any) {
      const current = get().reposts
      set({ reposts: new Set([...current, postId]) })
      throw error
    }
  },

  addComment: async (postId: string, text: string) => {
    try {
      // Optimistic update - increment comment count immediately
      const feedStore = useFeedStore.getState()
      const post = feedStore.explore.find(p => p.id === postId)
      if (post) {
        feedStore.updatePost(postId, {
          comments: (post.comments || 0) + 1,
        })
      }
      
      // Then sync with API
      const response = await postsApi.addComment(postId, text)
      // Update with actual count from server
      feedStore.updatePost(postId, {
        comments: response.comments,
      })
      // Refresh notifications after commenting
      useNotificationStore.getState().fetchNotifications().catch(() => {})
      Toast.show({
        type: 'success',
        text1: 'Comment added',
        text2: 'Your comment has been posted',
      })
    } catch (error: any) {
      console.error('Add comment error:', error)
      // Revert optimistic update on error
      const post = useFeedStore.getState().explore.find(p => p.id === postId)
      if (post && post.comments > 0) {
        useFeedStore.getState().updatePost(postId, {
          comments: post.comments - 1,
        })
      }
      Toast.show({
        type: 'error',
        text1: 'Failed to add comment',
        text2: error?.response?.data?.message || 'Please try again',
      })
      throw error
    }
  },

  isLiked: (postId: string) => {
    return get().likes.has(postId)
  },

  isSaved: (postId: string) => {
    return get().saves.has(postId)
  },

  isReposted: (postId: string) => {
    return get().reposts.has(postId)
  },

  clearEngagements: () => {
    set({ likes: new Set(), saves: new Set(), reposts: new Set() })
  },

  addReplyToComment: async (postId: string, commentId: string, text: string) => {
    try {
      // Optimistic update - increment comment count immediately
      const feedStore = useFeedStore.getState()
      const post = feedStore.explore.find(p => p.id === postId)
      if (post) {
        feedStore.updatePost(postId, {
          comments: (post.comments || 0) + 1,
        })
      }
      
      // Then sync with API
      const response = await postsApi.addReplyToComment(postId, commentId, text)
      // Update with actual count from server
      feedStore.updatePost(postId, {
        comments: response.comments,
      })
      // Refresh notifications after replying
      useNotificationStore.getState().fetchNotifications().catch(() => {})
      Toast.show({
        type: 'success',
        text1: 'Reply added',
        text2: 'Your reply has been posted',
      })
    } catch (error: any) {
      console.error('Add reply error:', error)
      // Revert optimistic update on error
      const post = useFeedStore.getState().explore.find(p => p.id === postId)
      if (post && post.comments > 0) {
        useFeedStore.getState().updatePost(postId, {
          comments: post.comments - 1,
        })
      }
      Toast.show({
        type: 'error',
        text1: 'Failed to add reply',
        text2: error?.response?.data?.message || 'Please try again',
      })
      throw error
    }
  },

  toggleCommentLike: async (postId: string, commentId: string) => {
    try {
      await postsApi.toggleCommentLike(postId, commentId)
    } catch (error: any) {
      console.error('Toggle comment like error:', error)
      Toast.show({
        type: 'error',
        text1: 'Failed to update comment like',
        text2: error?.response?.data?.message || 'Please try again',
      })
      throw error
    }
  },

  toggleReplyLike: async (postId: string, commentId: string, replyId: string) => {
    try {
      await postsApi.toggleReplyLike(postId, commentId, replyId)
    } catch (error: any) {
      console.error('Toggle reply like error:', error)
      Toast.show({
        type: 'error',
        text1: 'Failed to update reply like',
        text2: error?.response?.data?.message || 'Please try again',
      })
      throw error
    }
  },
}))
