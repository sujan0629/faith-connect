import { create } from 'zustand'
import { Role } from './authStore'

export type PostType = 'post' | 'reel'
export type MediaType = 'image' | 'video' | 'none'

export type Post = {
  id: string
  authorId: string
  authorName: string
  authorAvatar?: string
  faith?: string
  type: PostType
  media?: string
  mediaType?: MediaType
  title: string
  body: string
  likes: number
  comments: number
  saves: number
  isLiked?: boolean
  isSaved?: boolean
  createdAt: string
}

type FeedState = {
  explore: Post[]
  following: Post[]
  addPost: (post: Omit<Post, 'id' | 'likes' | 'comments' | 'saves' | 'createdAt'>) => void
  toggleLike: (id: string) => void
  toggleSave: (id: string) => void
  seed: (options?: { role?: Role }) => void
}

const seedPosts = (): Post[] => [
  {
    id: 'p1',
    authorId: 'l1',
    authorName: 'Rabbi Abraham Cohen',
    authorAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    faith: 'Judaism',
    type: 'post',
    media: undefined,
    mediaType: 'none',
    title: 'Morning Reflection',
    body: 'Lorem ipsum dolor sit amet consectetur. Nisl feugiat gravida faucibus venenatis ornare dictum vulputate purus duis. Justo dictumst gravida egestas mauris sed scelerisque in pulvinar. Enim morbi senectus est et ac.',
    likes: 48800,
    comments: 180000,
    saves: 12000,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p2',
    authorId: 'l2',
    authorName: 'Rabbi Aaron Kaplan',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cmFuZG9tJTIwcGVvcGxlfGVufDB8fDB8fHww',
    faith: 'Judaism',
    type: 'reel',
    media: 'https://dswa1xdat8uez.cloudfront.net/2o3hk%2Ffile%2Ff21ce160e126c575ed11db5f38f945b1_842bcd1136e67553cffb1f1c4d9ad9a7.mp4?response-content-disposition=inline%3Bfilename%3D%22f21ce160e126c575ed11db5f38f945b1_842bcd1136e67553cffb1f1c4d9ad9a7.mp4%22%3B&response-content-type=video%2Fmp4&Expires=1767932931&Signature=JPcZDmxFMQ~H1~jBd6ECAJH11IQGhRsNeLOgPIKfwZEtkrUxIHn-I4y2blc9Wq1eADT7hRn5542M88P1tT9uWP16UIAKQkxT7d~u6P8T2pl2qWHAa8VHd6riy2p4ogI1XGETS6ZAASL471GM7dNl64sfB5zNGmY5z3qMEjr2hs2WTclt2jGGrGJP1CedKquAjhiymfbmVhxGFSfA~ylg5gCrMt-XJD3~FDSrLcHDDXHbr9euJuEEWoSuzFItrfgVGxrcrG7Q0r6xfYxf9F4A2DsTfgqnaWRtEO-vGMOOnXa1Sbr6uHUXnTPwUVv25GUZ8TXJiXI78J5Mwkzbn-jNNw__&Key-Pair-Id=APKAJT5WQLLEOADKLHBQ',
    mediaType: 'video',
    title: 'Video Title Goes Here...',
    body: 'Lorem ipsum dolor sit amet consectetur. Vivamus aenean accumsan ipsum blandit velit neque.',
    likes: 20200,
    comments: 12000,
    saves: 16000,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p3',
    authorId: 'l3',
    authorName: 'Rabbi David Rosenberg',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    faith: 'Judaism',
    type: 'post',
    media: 'https://d2fy7spvltzu3v.cloudfront.net/9uugk%2Ffile%2Fa2e07c3cb218fcfc6fa06dc5f4e8c2a3_2581d412cf9d7cce87a2bb70a48ae6f7.mp4?response-content-disposition=inline%3Bfilename%3D%22a2e07c3cb218fcfc6fa06dc5f4e8c2a3_2581d412cf9d7cce87a2bb70a48ae6f7.mp4%22%3B&response-content-type=video%2Fmp4&Expires=1767932610&Signature=JuVJzXLV2C6cKHLBlsoowT64tLxQDqzUgvCuHh9lYiGJKDjOf9JWJKJL6PMH5sLZcjt7Agw7nxY6gLAtJyfQDi3xMitVNAmxZ21VoY7NvUesdpk3yfw3P4ZBWpDJfEQj~2Bgj87B738fa8ZuGePZQ3~zGu8nFzgQV-ethJUCr~snv0xWFwYdLQkxyBNqlKpIqoYjaqXEweI7-N8pXR42Wjr-qKd1z9GDEMR6euOO3I3UphtDqULJSyRV6-u61laKrky1ziMCKBUixRp0vCbzk-Ea2vRTWNBGxrenjFDWIaxvPiRGK3rmiQpisV-hjyZy~XpXejeevM4-sfp402guAw__&Key-Pair-Id=APKAJT5WQLLEOADKLHBQ',
    mediaType: 'video',
    title: 'Weekly Torah Study',
    body: 'Join us for an insightful discussion on this weeks parsha. Understanding the deeper meanings of our sacred texts.',
    likes: 20000,
    comments: 11000,
    saves: 14000,
    isLiked: false,
    isSaved: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p4',
    authorId: 'l4',
    authorName: 'Rabbi Samuel Katz',
    authorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    faith: 'Judaism',
    type: 'reel',
    media: 'https://cdn.jumpshare.com/preview/0BEtzkNid8UILtd_FAQivYJxV0lX5A3v8WxvYKzZ7qgW-RYv5GKfzV9-aMzI6gatxN9SewlvAuFFg1Gkp_0Aj4y_tg_NyL3Obg2k1NNtijaIplklv193BJefVJBsVl38St0O72FvXUUf45oGVxEuhW6yjbN-I2pg_cnoHs_AmgI.mp4',
    mediaType: 'video',
    title: 'Bossing it',
    body: 'Who was the best CEO of 2025?',
    likes: 15000,
    comments: 8000,
    saves: 9000,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p5',
    authorId: 'l5',
    authorName: 'Pastor Michael Stevens',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    faith: 'Christianity',
    type: 'post',
    media: undefined,
    mediaType: 'none',
    title: 'Grace and Mercy',
    body: 'In times of difficulty, remember that grace is not earned but given freely. Let us extend that same mercy to others as we have received it.',
    likes: 32500,
    comments: 8900,
    saves: 11200,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p6',
    authorId: 'l6',
    authorName: 'Imam Hassan Al-Rashid',
    authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    faith: 'Islam',
    type: 'post',
    media: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    mediaType: 'image',
    title: 'Evening Prayer',
    body: 'The beauty of maghrib reminds us to be grateful for another day. Take a moment to reflect on the blessings bestowed upon you.',
    likes: 28300,
    comments: 9400,
    saves: 13500,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p7',
    authorId: 'l7',
    authorName: 'Rabbi Sarah Goldstein',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    faith: 'Judaism',
    type: 'post',
    media: undefined,
    mediaType: 'none',
    title: 'Shabbat Shalom',
    body: 'As we enter the day of rest, may we find peace in disconnecting from our busy lives and reconnecting with our faith and loved ones.',
    likes: 41200,
    comments: 14500,
    saves: 18900,
    isSaved: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p8',
    authorId: 'l8',
    authorName: 'Pastor Jennifer Wright',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    faith: 'Christianity',
    type: 'reel',
    media: 'https://cdn.jumpshare.com/preview/A2oDlo9EWY6F4ICfGPoC7KqUZdKLKxKmzfTZ7Bijv-sFB06vkEAQZ8jAUabXjYveWOpHQsjCKUIglGPsZw0j15gJFsCZ4eDH3rHuJeYhIEAswL3owDidJZ4baVFfBIKlrSj526DLlEVTF9V0HzrbYm6yjbN-I2pg_cnoHs_AmgI.mp4',
    mediaType: 'video',
    title: 'Sunday Worship Highlights',
    body: 'Join us as we celebrate together in worship. The joy of the Lord is our strength!',
    likes: 55600,
    comments: 22100,
    saves: 31400,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p9',
    authorId: 'l9',
    authorName: 'Imam Omar Abdullah',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    faith: 'Islam',
    type: 'post',
    media: undefined,
    mediaType: 'none',
    title: 'Patience in Trials',
    body: 'Remember, with every hardship comes ease. Allah does not burden a soul beyond what it can bear. Trust in His plan and remain steadfast.',
    likes: 37800,
    comments: 10200,
    saves: 15600,
    isLiked: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p10',
    authorId: 'l10',
    authorName: 'Rabbi Jonathan Levine',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    faith: 'Judaism',
    type: 'post',
    media: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    mediaType: 'image',
    title: 'Ancient Wisdom',
    body: 'The teachings of our ancestors continue to guide us today. Let us honor their wisdom by living with integrity and compassion.',
    likes: 29100,
    comments: 7800,
    saves: 12300,
    createdAt: new Date().toISOString(),
  },
]

export const useFeedStore = create<FeedState>((set, get) => ({
  explore: seedPosts(),
  following: seedPosts().slice(0, 2),
  addPost: (payload) => {
    const post: Post = {
      ...payload,
      id: `post-${Date.now()}`,
      likes: 0,
      comments: 0,
      saves: 0,
      createdAt: new Date().toISOString(),
    }
    set((state) => ({
      explore: [post, ...state.explore],
      following: payload.type === 'post' ? [post, ...state.following] : state.following,
    }))
  },
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
    })),
  seed: () => set({ explore: seedPosts(), following: seedPosts().slice(0, 2) }),
}))
