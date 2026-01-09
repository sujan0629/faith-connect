import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { useLocalSearchParams, Stack } from 'expo-router'
import { useFeedStore } from '../../stores/feedStore'
import { PostDetail } from '../../components/Feed/PostDetail'
import { CommentsList } from '../../components/Feed/CommentsList'
import { CommentInput } from '../../components/Feed/CommentInput'
import { PostScreenHeader } from '../../components/Headers/PostScreenHeader'
import { useState } from 'react'

export type Comment = {
  id: string
  authorId: string
  authorName: string
  authorAvatar?: string
  text: string
  likes: number
  isLiked: boolean
  replies: number
  repliesData?: Comment[] // Add nested replies
  createdAt: string
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams()
  const { explore, following, toggleLike, toggleSave } = useFeedStore()
  
  // Find the post from either explore or following feed
  const post = [...explore, ...following].find((p) => p.id === id)

  // Mock comments data
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'c1',
      authorId: 'u1',
      authorName: 'Willard Purnell',
      authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
      text: 'Lorem ipsum dolor sit amet consectetur. Blandit pellentesque purus semper urna faucibus amet eros fames.',
      likes: 600,
      isLiked: true,
      replies: 2,
      createdAt: '1 hour ago',
      repliesData: [
        {
          id: 'c1-r1',
          authorId: 'u2',
          authorName: 'Kristoforo Weatherdon',
          authorAvatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
          text: 'Thanks for sharing this amazing content! Really insightful.',
          likes: 45,
          isLiked: false,
          replies: 1,
          createdAt: '45 minutes ago',
          repliesData: [
            {
              id: 'c1-r1-r1',
              authorId: 'u1',
              authorName: 'Willard Purnell',
              authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
              text: 'Glad you found it helpful! Let me know if you have any questions.',
              likes: 12,
              isLiked: true,
              replies: 0,
              createdAt: '30 minutes ago'
            }
          ]
        },
        {
          id: 'c1-r2',
          authorId: 'u3',
          authorName: 'Alice Johnson',
          authorAvatar: 'https://plus.unsplash.com/premium_photo-1689530775582-83b8abdb5020?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cmFuZG9tJTIwcGVyc29ufGVufDB8fDB8fHww',
          text: 'Could you elaborate on the second point? I\'m a bit confused.',
          likes: 23,
          isLiked: false,
          replies: 0,
          createdAt: '30 minutes ago'
        }
      ]
    },
    {
      id: 'c2',
      authorId: 'u2',
      authorName: 'Kristoforo Weatherdon',
      authorAvatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
      text: 'This is exactly what I was looking for. Perfect timing!',
      likes: 268,
      isLiked: false,
      replies: 0,
      createdAt: '2 hours ago'
    },
  ])

  const handleLikeComment = (commentId: string) => {
    setComments(comments.map(c => 
      c.id === commentId 
        ? { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 }
        : c
    ))
  }

  const handleAddComment = (text: string) => {
    const newComment: Comment = {
      id: `c${comments.length + 1}`,
      authorId: 'current-user',
      authorName: 'You',
      text,
      likes: 0,
      isLiked: false,
      replies: 0,
      createdAt: 'Just now',
    }
    setComments([...comments, newComment])
  }

  if (!post) {
    return <View className="flex-1 bg-white" />
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <PostScreenHeader title={post.authorName} />
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView className="flex-1 bg-white">
          <PostDetail 
            post={post} 
            onLike={() => toggleLike(post.id)}
            onSave={() => toggleSave(post.id)}
          />
          <View className="mt-4">
            <CommentsList 
              comments={comments}
              onLikeComment={handleLikeComment}
            />
          </View>
        </ScrollView>
        <CommentInput onSubmit={handleAddComment} />
      </KeyboardAvoidingView>
    </>
  )
}
