import { create } from 'zustand'
import {
  UserVector,
  buildUserVector,
  rankExploreFeeds,
  rankExploreFeeds_ColdStart,
  updateUserVector,
  normalizeVector,
} from '../lib/feedAlgorithm'
import { rankReels, rankReelsWithinBuckets } from '../lib/reelsAlgorithm'
import { cacheUserVector, getCachedUserVector, invalidateUserVectorCache } from '../lib/caching'

export type PostType = 'post' | 'reel'
export type MediaType = 'image' | 'video' | 'reel' | 'none'

export type Post = {
  id: string
  authorId: string
  authorName: string
  authorAvatar?: string
  faith?: string
  title: string
  body: string
  media?: string
  mediaType?: MediaType
  type: PostType
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

type FeedState = {
  explore: Post[]
  following: Post[]
  reels: Post[]
  userVector: UserVector | null
  authorFaiths: Record<string, string>
  setFeed: (posts: Post[]) => void
  setFollowing: (posts: Post[]) => void
  setReels: (reels: Post[]) => void
  updatePost: (id: string, post: Partial<Post>) => void
  addPost: (post: Post) => void
  removePost: (id: string) => void
  toggleLike: (id: string) => void
  toggleSave: (id: string) => void
  // Algorithm methods
  initializeUserVector: (userId: string, faith?: string, contentFocus?: string[]) => Promise<void>
  loadCachedVector: (userId: string) => Promise<void>
  recordInteraction: (userId: string, postId: string, type: 'like' | 'comment' | 'save' | 'view', authorFaith?: string) => Promise<void>
  rankExplore: (userId: string) => void
  rankFollowing: (userId: string) => void
  rankReelsContent: (userId: string) => void
  setAuthorFaith: (authorId: string, faith: string) => void
}

export const useFeedStore = create<FeedState>((set, get) => ({
  explore: [],
  following: [],
  reels: [],
  userVector: null,
  authorFaiths: {},

  setFeed: (posts) => set({ explore: posts }),
  setFollowing: (posts) => set({ following: posts }),
  setReels: (reels) => set({ reels }),

  setAuthorFaith: (authorId, faith) =>
    set((state) => ({
      authorFaiths: { ...state.authorFaiths, [authorId]: faith },
    })),

  addPost: (post) =>
    set((state) => ({
      explore: [post, ...state.explore],
      following: post.type === 'post' ? [post, ...state.following] : state.following,
    })),

  removePost: (id) =>
    set((state) => ({
      explore: state.explore.filter((p) => p.id !== id),
      following: state.following.filter((p) => p.id !== id),
      reels: state.reels.filter((p) => p.id !== id),
    })),

  updatePost: (id, partial) =>
    set((state) => ({
      explore: state.explore.map((p) => (p.id === id ? { ...p, ...partial } : p)),
      following: state.following.map((p) => (p.id === id ? { ...p, ...partial } : p)),
      reels: state.reels.map((p) => (p.id === id ? { ...p, ...partial } : p)),
    })),

  toggleLike: (id) =>
    set((state) => ({
      explore: state.explore.map((p) =>
        p.id === id
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p,
      ),
      following: state.following.map((p) =>
        p.id === id
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p,
      ),
      reels: state.reels.map((p) =>
        p.id === id
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p,
      ),
    })),

  toggleSave: (id) =>
    set((state) => ({
      explore: state.explore.map((p) =>
        p.id === id
          ? { ...p, isSaved: !p.isSaved, saves: p.isSaved ? p.saves - 1 : p.saves + 1 }
          : p,
      ),
      following: state.following.map((p) =>
        p.id === id
          ? { ...p, isSaved: !p.isSaved, saves: p.isSaved ? p.saves - 1 : p.saves + 1 }
          : p,
      ),
      reels: state.reels.map((p) =>
        p.id === id
          ? { ...p, isSaved: !p.isSaved, saves: p.isSaved ? p.saves - 1 : p.saves + 1 }
          : p,
      ),
    })),

  // Initialize user vector on first load
  initializeUserVector: async (userId, faith, contentFocus) => {
    const vector = buildUserVector(faith, contentFocus, 0)
    set({ userVector: vector })
    await cacheUserVector(userId, vector)
  },

  // Load cached vector if available
  loadCachedVector: async (userId) => {
    const cached = await getCachedUserVector(userId)
    if (cached) {
      set({ userVector: cached })
    }
  },

  // Record interaction and update user vector
  recordInteraction: async (userId, postId, type, authorFaith) => {
    const state = get()
    const post = [...state.explore, ...state.following, ...state.reels].find(
      (p) => p.id === postId,
    )

    if (!post || !state.userVector) return

    const updated = updateUserVector(state.userVector, post, type, authorFaith)
    const normalized = normalizeVector(updated)

    set({ userVector: normalized })
    await cacheUserVector(userId, normalized)
    await invalidateUserVectorCache(userId) // Invalidate old cache immediately
  },

  // Rank explore feed based on user vector
  rankExplore: (userId) => {
    const state = get()
    if (!state.userVector) {
      // Cold start: use faith-based ranking (no user vector yet)
      const ranked = rankExploreFeeds_ColdStart(state.explore)
      set({ explore: ranked })
      return
    }

    // Personalized ranking
    const ranked = rankExploreFeeds(
      state.explore,
      state.userVector,
      state.authorFaiths,
    )
    set({ explore: ranked })
  },

  // Rank following feed
  rankFollowing: (userId) => {
    const state = get()
    if (!state.userVector) {
      return
    }

    const ranked = rankExploreFeeds(
      state.following,
      state.userVector,
      state.authorFaiths,
      { similarity: 0.4, engagement: 0.4, freshness: 0.2 }, // Higher engagement weight for following
    )
    set({ following: ranked })
  },

  // Rank reels content
  rankReelsContent: (userId) => {
    const state = get()
    const userFaith = state.userVector?.faith ? Object.keys(state.userVector.faith)[0] : undefined
    
    // Use bucket-based ranking for fair comparison across video lengths
    const ranked = rankReelsWithinBuckets(state.reels, userFaith)
    set({ reels: ranked })
  },
}))
