/**
 * Feed & Reels Algorithm Implementation
 * Handles personalized ranking based on similarity, engagement, and freshness
 */

import { Post } from '../stores/feedStore'

/**
 * User Vector for similarity calculations
 * Represents user's interests and preferences across multiple dimensions
 */
export interface UserVector {
  faith: Record<string, number>
  topics: Record<string, number>
  leaders: Record<string, number>
  contentTypes: Record<string, number>
  interactionCount: number
  lastUpdated: Date
}

/**
 * Post Vector for similarity calculations
 * Represents post's characteristics
 */
export interface PostVector {
  faith: Record<string, number>
  topics: Record<string, number>
  leaderId: string
  contentType: string
}

/**
 * Engagement metrics for a post
 */
export interface EngagementMetrics {
  views: number
  likes: number
  comments: number
  saves: number
  shares: number
}

/**
 * Build user vector from user profile and interaction history
 * Initialize with faith and basic content preferences
 */
export function buildUserVector(
  faith?: string,
  contentFocus?: string[],
  interactionCount: number = 0,
): UserVector {
  const vector: UserVector = {
    faith: {},
    topics: {},
    leaders: {},
    contentTypes: {
      image: 0.25,
      video: 0.35,
      reel: 0.3,
      none: 0.1,
    },
    interactionCount,
    lastUpdated: new Date(),
  }

  // Initialize faith vector
  if (faith) {
    vector.faith[faith.toLowerCase()] = 0.8
    vector.faith['spiritual'] = 0.2
  } else {
    // Default: neutral across faiths
    vector.faith['spiritual'] = 0.5
  }

  // Initialize topic vector from content focus
  if (contentFocus && contentFocus.length > 0) {
    const topicWeight = 1.0 / contentFocus.length
    contentFocus.forEach((topic) => {
      vector.topics[topic.toLowerCase()] = topicWeight
    })
  } else {
    // Default topics
    vector.topics = {
      prayer: 0.3,
      motivation: 0.3,
      philosophy: 0.2,
      daily_wisdom: 0.2,
    }
  }

  return vector
}

/**
 * Build post vector from post metadata
 * Aligns with backend mediaType: 'image' | 'video' | 'reel' | 'none'
 * Safely handles missing or undefined faith field
 */
export function buildPostVector(post: Post, authorFaith?: string): PostVector {
  const vector: PostVector = {
    faith: {},
    topics: {},
    leaderId: post.authorId,
    contentType: post.mediaType || 'none',
  }

  // Set faith category - with null safety
  const postFaith = post.faith && post.faith !== 'unknown' ? post.faith : null
  if (postFaith) {
    vector.faith[postFaith.toLowerCase()] = 1.0
  } else if (authorFaith && authorFaith !== 'unknown') {
    vector.faith[authorFaith.toLowerCase()] = 0.8
    vector.faith['spiritual'] = 0.2
  } else {
    // Default: neutral if no faith info
    vector.faith['spiritual'] = 0.5
  }

  // Extract topics from post body (simple keyword matching)
  const keywords = extractKeywords(post.body || '')
  keywords.forEach((keyword) => {
    vector.topics[keyword] = (vector.topics[keyword] || 0) + 0.2
  })

  // Normalize topic vector
  const topicSum = Object.values(vector.topics).reduce((a, b) => a + b, 0)
  if (topicSum > 0) {
    Object.keys(vector.topics).forEach((key) => {
      vector.topics[key] = vector.topics[key] / topicSum
    })
  }

  return vector
}

/**
 * Calculate cosine similarity between two vectors
 * Similarity = (U · P) / (||U|| · ||P||)
 */
export function cosineSimilarity(
  userVector: UserVector,
  postVector: PostVector,
): number {
  let dotProduct = 0
  let userMagnitude = 0
  let postMagnitude = 0

  // Calculate faith similarity
  const allFaithKeys = new Set([
    ...Object.keys(userVector.faith),
    ...Object.keys(postVector.faith),
  ])
  let faithDot = 0
  let faithUserMag = 0
  let faithPostMag = 0

  allFaithKeys.forEach((key) => {
    const uVal = userVector.faith[key] || 0
    const pVal = postVector.faith[key] || 0
    faithDot += uVal * pVal
    faithUserMag += uVal * uVal
    faithPostMag += pVal * pVal
  })

  // Calculate topic similarity
  const allTopicKeys = new Set([
    ...Object.keys(userVector.topics),
    ...Object.keys(postVector.topics),
  ])
  let topicDot = 0
  let topicUserMag = 0
  let topicPostMag = 0

  allTopicKeys.forEach((key) => {
    const uVal = userVector.topics[key] || 0
    const pVal = postVector.topics[key] || 0
    topicDot += uVal * pVal
    topicUserMag += uVal * uVal
    topicPostMag += pVal * pVal
  })

  // Weighted combination: 60% faith, 40% topics
  const faithSimilarity =
    faithUserMag > 0 && faithPostMag > 0
      ? faithDot / (Math.sqrt(faithUserMag) * Math.sqrt(faithPostMag))
      : 0
  const topicSimilarity =
    topicUserMag > 0 && topicPostMag > 0
      ? topicDot / (Math.sqrt(topicUserMag) * Math.sqrt(topicPostMag))
      : 0

  return 0.6 * Math.max(0, faithSimilarity) + 0.4 * Math.max(0, topicSimilarity)
}

/**
 * Calculate engagement rate
 * Formula: (likes + 2*comments + 3*saves) / impressions
 * Uses real impression data from backend when available
 * Fallback to estimated impressions if backend hasn't tracked them yet
 */
export function calculateEngagementRate(engagement: EngagementMetrics): number {
  // Use actual impressions if available, otherwise estimate
  const impressions = Math.max(
    engagement.views || 1,
    (engagement.likes + engagement.comments * 2 + engagement.saves * 3) || 1,
  )

  const numerator = engagement.likes * 1 + engagement.comments * 2 + engagement.saves * 3
  return numerator / impressions
}

/**
 * Calculate freshness score
 * Formula: e^(-λ * age_hours) where λ = 0.1
 */
export function calculateFreshness(createdAt: string): number {
  const lambda = 0.1
  const now = new Date()
  const created = new Date(createdAt)
  const ageHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60)
  return Math.exp(-lambda * ageHours)
}

/**
 * Rank posts using hybrid interest-engagement algorithm
 * Score = α·Similarity + β·EngagementRate + γ·Freshness
 * Default weights: α=0.5, β=0.3, γ=0.2
 * 
 * Filters out reels (type: 'reel') - only processes regular posts
 * Uses real impression data from backend (post.impressions field)
 */
export function rankExploreFeeds(
  posts: Post[],
  userVector: UserVector,
  authorFaiths?: Record<string, string>,
  weights?: { similarity: number; engagement: number; freshness: number },
): Post[] {
  const w = weights || { similarity: 0.5, engagement: 0.3, freshness: 0.2 }

  // Include both posts and reels for ranking
  const allPosts = posts

  // Calculate scores
  const scoredPosts = allPosts.map((post) => {
    const postVector = buildPostVector(post, authorFaiths?.[post.authorId])
    const similarity = cosineSimilarity(userVector, postVector)
    
    // Use actual impressions from backend, with fallback estimation
    const actualImpressions = post.impressions || 0
    const estimatedImpressions = Math.max(
      post.likes + post.comments + post.saves + 1,
      Math.max(post.likes, post.saves, post.comments) * 3,
    )
    const impressions = actualImpressions > 0 ? actualImpressions : estimatedImpressions
    
    const engagementRate = calculateEngagementRate({
      views: impressions,
      likes: post.likes,
      comments: post.comments,
      saves: post.saves,
      shares: 0,
    })
    const freshness = calculateFreshness(post.createdAt)

    const score =
      w.similarity * similarity +
      w.engagement * engagementRate +
      w.freshness * freshness

    return { post, score, similarity, engagementRate, freshness }
  })

  // Sort by score descending
  return scoredPosts.sort((a, b) => b.score - a.score).map((item) => item.post)
}

/**
 * Update user vector based on interaction
 * Like: +0.1, Comment: +0.3, Save: +0.5
 */
export function updateUserVector(
  vector: UserVector,
  post: Post,
  interactionType: 'like' | 'comment' | 'save' | 'view',
  authorFaith?: string,
): UserVector {
  const weights = {
    like: 0.1,
    comment: 0.3,
    save: 0.5,
    view: 0.05,
  }

  const weight = weights[interactionType]
  const postVector = buildPostVector(post, authorFaith)

  // Update faith
  Object.entries(postVector.faith).forEach(([faith, value]) => {
    vector.faith[faith] = (vector.faith[faith] || 0) + value * weight
  })

  // Update topics
  Object.entries(postVector.topics).forEach(([topic, value]) => {
    vector.topics[topic] = (vector.topics[topic] || 0) + value * weight
  })

  // Update leader affinity
  vector.leaders[post.authorId] = (vector.leaders[post.authorId] || 0) + weight

  // Apply time decay to existing values (optional: could be done during fetch)
  vector.interactionCount += 1
  vector.lastUpdated = new Date()

  return vector
}

/**
 * Normalize vector to prevent any dimension from dominating
 */
export function normalizeVector(vector: UserVector): UserVector {
  const normalized = { ...vector }

  // Normalize faith
  const faithSum = Object.values(vector.faith).reduce((a, b) => a + b, 0)
  if (faithSum > 0) {
    Object.keys(normalized.faith).forEach((key) => {
      normalized.faith[key] = vector.faith[key] / faithSum
    })
  }

  // Normalize topics
  const topicSum = Object.values(vector.topics).reduce((a, b) => a + b, 0)
  if (topicSum > 0) {
    Object.keys(normalized.topics).forEach((key) => {
      normalized.topics[key] = vector.topics[key] / topicSum
    })
  }

  // Normalize content types
  const contentSum = Object.values(vector.contentTypes).reduce((a, b) => a + b, 0)
  if (contentSum > 0) {
    Object.keys(normalized.contentTypes).forEach((key) => {
      normalized.contentTypes[key] = vector.contentTypes[key] / contentSum
    })
  }

  // Normalize leaders (top 10 leaders only to prevent bloat)
  const leaders = Object.entries(vector.leaders)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
  normalized.leaders = Object.fromEntries(leaders)

  if (Object.keys(normalized.leaders).length > 0) {
    const leaderSum = Object.values(normalized.leaders).reduce((a, b) => a + b, 0)
    Object.keys(normalized.leaders).forEach((key) => {
      normalized.leaders[key] = normalized.leaders[key] / leaderSum
    })
  }

  return normalized
}

/**
 * Extract keywords from text for topic matching
 */
function extractKeywords(text: string): string[] {
  const commonKeywords = [
    'prayer',
    'meditation',
    'philosophy',
    'daily_wisdom',
    'motivation',
    'scripture',
    'faith',
    'spiritual',
    'devotion',
    'guidance',
    'wisdom',
    'mindfulness',
  ]

  const lowerText = text.toLowerCase()
  return commonKeywords.filter((keyword) => lowerText.includes(keyword))
}

/**
 * Handle cold start problem for new users
 * Falls back to faith-based + global popularity ranking
 * Only processes regular posts (type: 'post')
 */
export function rankExploreFeeds_ColdStart(
  posts: Post[],
  userFaith?: string,
): Post[] {
  // Filter out reels - this function handles regular posts only
  const regularPosts = posts.filter((p) => p.type === 'post')
  
  // Score = 0.7 * faithMatch + 0.3 * globalPopularity
  const scoredPosts = regularPosts.map((post) => {
    // Check if author's faith matches user's faith
    const faithMatch = post.faith && userFaith && post.faith.toLowerCase() === userFaith.toLowerCase()
      ? 1.0
      : post.faith ? 0.5 : 0.3

    const globalPopularity = Math.log(post.likes + post.comments + post.saves + 1) / 10

    const score = 0.7 * faithMatch + 0.3 * globalPopularity
    return { post, score }
  })

  return scoredPosts.sort((a, b) => b.score - a.score).map((item) => item.post)
}
