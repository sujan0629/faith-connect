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
    media: 'https://codelitsstudio.com/videos/reel-2.mp4',
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
    media: 'https://codelitsstudio.com/videos/ecommerce.mp4',
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
    media: 'https://codelitsstudio.com/videos/reel-1.mp4',
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
    media: 'https://wjc.imgix.net/horizon/assets/e0SUzfic/ramadan-3384043_640.jpg?ixlib=rails-4.3.1&w=1200&h=780&auto=format%2Ccompress&fit=crop&q=60&lossless=true&s=853f215402188b21182dacbed34f2c32',
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
    media: 'https://codelitsstudio.com/videos/reel3.mp4',
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
    media: 'https://images.unsplash.com/photo-1566475955255-404134a79aeb?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8NCUzQTN8ZW58MHx8MHx8fDA%3D',
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
