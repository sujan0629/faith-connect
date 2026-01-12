import { api } from './axios'

export type PostResponse = {
  id: string
  authorId: string
  authorName: string
  authorAvatar?: string
  faith?: string
  title: string
  body: string
  mediaType: 'image' | 'video' | 'reel' | 'none'
  media?: string
  type: 'post' | 'reel'
  likes: number
  isLiked: boolean
  saves: number
  isSaved: boolean
  reposts: number
  isReposted: boolean
  comments: number
  videoDuration?: number
  impressions: number
  avgWatchTime: number
  completionRate: number
  replayCount: number
  createdAt: string
}

export const postsApi = {
  // Create a normal post (text or text + image)
  createPost: async (title: string, body: string, image?: string, imagePublicId?: string): Promise<PostResponse> => {
    const res = await api.post('/posts', {
      title,
      body,
      image,
      imagePublicId,
    })
    return res.data
  },

  // Create a video post (> 60 seconds)
  createVideoPost: async (
    title: string,
    body: string,
    video: string,
    videoPublicId: string,
    duration: number,
  ): Promise<PostResponse> => {
    const res = await api.post('/posts/video', {
      title,
      body,
      video,
      videoPublicId,
      duration,
    })
    return res.data
  },

  // Create a reel (< 60 seconds)
  createReel: async (
    title: string,
    body: string,
    video: string,
    videoPublicId: string,
    duration: number,
  ): Promise<PostResponse> => {
    const res = await api.post('/posts/reel', {
      title,
      body,
      video,
      videoPublicId,
      duration,
    })
    return res.data
  },

  // Get feed posts
  getFeed: async (limit = 20, skip = 0): Promise<PostResponse[]> => {
    const res = await api.get('/posts', {
      params: { limit, skip },
    })
    return res.data
  },

  // Get following feed (posts from users you follow)
  getFollowing: async (limit = 20, skip = 0): Promise<PostResponse[]> => {
    const res = await api.get('/posts/following', {
      params: { limit, skip },
    })
    return res.data
  },

  // Get reels
  getReels: async (limit = 20, skip = 0): Promise<PostResponse[]> => {
    const res = await api.get('/posts/reels', {
      params: { limit, skip },
    })
    return res.data
  },

  // Get saved posts
  getSavedPosts: async (limit = 20, skip = 0): Promise<PostResponse[]> => {
    const res = await api.get('/posts/saved', {
      params: { limit, skip },
    })
    return res.data
  },

  // Get reposted posts
  getRepostedPosts: async (limit = 20, skip = 0, userId?: string): Promise<PostResponse[]> => {
    const res = await api.get('/posts/reposts', {
      params: { limit, skip, ...(userId && { userId }) },
    })
    return res.data
  },

  // Get posts by author
  getAuthorPosts: async (authorId: string): Promise<PostResponse[]> => {
    const res = await api.get(`/posts/author/${authorId}`)
    return res.data
  },

  // Get single post
  getPost: async (postId: string): Promise<PostResponse> => {
    const res = await api.get(`/posts/${postId}`)
    return res.data
  },

  // Get comments for a post
  getComments: async (postId: string) => {
    const res = await api.get(`/posts/${postId}/comments`)
    return res.data
  },

  // Toggle like on a post
  toggleLike: async (postId: string): Promise<PostResponse> => {
    const res = await api.post(`/posts/${postId}/like`)
    return res.data
  },

  // Toggle save on a post
  toggleSave: async (postId: string): Promise<PostResponse> => {
    const res = await api.post(`/posts/${postId}/save`)
    return res.data
  },

  // Toggle repost on a post
  toggleRepost: async (postId: string): Promise<PostResponse> => {
    const res = await api.post(`/posts/${postId}/repost`)
    return res.data
  },

  // Add a comment to a post
  addComment: async (postId: string, text: string): Promise<PostResponse> => {
    const res = await api.post(`/posts/${postId}/comment`, { text })
    return res.data
  },

  // Add a reply to a comment
  addReplyToComment: async (postId: string, commentId: string, text: string): Promise<PostResponse> => {
    const res = await api.post(`/posts/${postId}/comment/${commentId}/reply`, { text })
    return res.data
  },

  // Toggle like on a comment
  toggleCommentLike: async (postId: string, commentId: string): Promise<PostResponse> => {
    const res = await api.post(`/posts/${postId}/comment/${commentId}/like`)
    return res.data
  },

  // Toggle like on a reply
  toggleReplyLike: async (postId: string, commentId: string, replyId: string): Promise<PostResponse> => {
    const res = await api.post(`/posts/${postId}/comment/${commentId}/reply/${replyId}/like`)
    return res.data
  },

  // Track watch event for reel/video
  trackWatch: async (postId: string, watchTime: number, duration: number) => {
    const res = await api.post(`/posts/${postId}/watch`, {
      watchTime,
      duration,
    })
    return res.data
  },

  // Track impression when post is viewed
  trackImpression: async (postId: string) => {
    const res = await api.post(`/posts/${postId}/impression`)
    return res.data
  },

  // Batch track impressions
  batchTrackImpressions: async (impressions: Array<{ postId: string; userId?: string }>) => {
    const res = await api.post('/posts/batch/impressions', { impressions })
    return res.data
  },

  // Get post metrics (impressions, watch time, completion rate, etc)
  getPostMetrics: async (postId: string) => {
    const res = await api.get(`/posts/${postId}/metrics`)
    return res.data
  },

  // Get trending reels
  getTrendingReels: async (limit = 20, hours = 24) => {
    const res = await api.get('/posts/trending/reels', {
      params: { limit, hours },
    })
    return res.data as PostResponse[]
  },

  // Search posts and reels
  searchPosts: async (query: string, type: 'post' | 'reel' = 'post', limit = 20, skip = 0) => {
    const res = await api.get('/posts/search', {
      params: { q: query, type, limit, skip },
    })
    return res.data as PostResponse[]
  },

  // Delete a post
  deletePost: async (postId: string): Promise<{ success: boolean }> => {
    const res = await api.delete(`/posts/${postId}`)
    return res.data
  },
}
