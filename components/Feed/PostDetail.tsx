import { View, Text, Pressable, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Post } from '../../stores/feedStore'
import { WebView } from 'react-native-webview'
import { SolidButton } from '../Buttons/SolidButton'

interface Props {
  post: Post
  onLike: () => void
  onSave: () => void
}

const formatCount = (num: number) => {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export const PostDetail = ({ post, onLike, onSave }: Props) => {
  return (
    <View className="bg-white px-5">
      {/* Header */}
      <View className="mb-4 mt-4 flex-row items-start justify-between">
        <View className="flex-1 flex-row items-center gap-3">
          {/* Avatar */}
          {post.authorAvatar ? (
            <Image
              source={{ uri: post.authorAvatar }}
              className="h-12 w-12 rounded-full bg-gray-200"
            />
          ) : (
            <View className="h-12 w-12 rounded-full bg-gray-200" />
          )}
          <View className="flex-1">
            <Text className="text-base font-bold text-[#111111]">{post.authorName}</Text>
            <Text className="text-xs text-[#999999]">1 hour ago</Text>
          </View>
        </View>
        <SolidButton 
          label="Follow" 
          onPress={() => {}}
          style={{ paddingVertical: 8, paddingHorizontal: 20 }}
        />
      </View>

      {/* Post Content */}
      <View>
        {/* Post Text */}
        {post.mediaType !== 'video' && (
          <Text className="mb-1 text-sm text-[#666666]">{post.body}</Text>
        )}

        {/* Video */}
        {post.mediaType === 'video' && post.media ? (
          <View className="mb-3">
            <View className="h-[300px] overflow-hidden rounded-xl bg-black">
              <WebView
                source={{ 
                  html: `
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                          body { 
                            margin: 0; 
                            padding: 0; 
                            background: #000; 
                            display: flex; 
                            justify-content: center; 
                            align-items: center; 
                            height: 100vh; 
                          }
                          video { 
                            width: 100%; 
                            height: 100%; 
                            object-fit: contain; 
                          }
                        </style>
                      </head>
                      <body>
                        <video controls playsinline>
                          <source src="${post.media}" type="video/mp4">
                        </video>
                      </body>
                    </html>
                  `
                }}
                allowsFullscreenVideo
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}              
                className="flex-1"
              />
            </View>
            {post.title && <Text className="mt-3 text-base font-bold text-[#111111]">{post.title}</Text>}
            <Text className="mt-2 text-sm leading-6 text-[#666666]">{post.body}</Text>
          </View>
        ) : null}

        {/* Image */}
        {post.mediaType === 'image' && post.media ? (
          <View className="mb-3 h-[350px] overflow-hidden rounded-xl bg-gray-100">
            <Image
              source={{ uri: post.media }}
              className="h-full w-full"
              resizeMode="cover"
            />
          </View>
        ) : null}
      </View>

      {/* Engagement Metrics */}
      <View className="flex-row border-b border-[#f0f0f0] items-center gap-6 py-4">
        <Pressable className="flex-row items-center gap-2">
          <Ionicons name="chatbubble-outline" size={20} color="#666666" />
          <Text className="text-sm font-semibold text-[#111111]">{formatCount(post.comments)}</Text>
        </Pressable>
        
        <Pressable className="flex-row items-center gap-2" onPress={onLike}>
          <Ionicons 
            name={post.isLiked ? 'heart' : 'heart-outline'} 
            size={20} 
            color={post.isLiked ? '#f472b6' : '#666666'} 
          />
          <Text className="text-sm font-semibold text-[#111111]">{formatCount(post.likes)}</Text>
        </Pressable>
        
        <Pressable className="flex-row items-center gap-2" onPress={onSave}>
          <Ionicons 
            name={post.isSaved ? 'bookmark' : 'bookmark-outline'} 
            size={18} 
            color={post.isSaved ? '#007AFF' : '#666666'} 
          />
          <Text className="text-sm font-semibold text-[#111111]">{formatCount(post.saves)}</Text>
        </Pressable>
        
        <Pressable className="flex-row items-center gap-2">
          <Ionicons name="repeat" size={20} color="#666666" />
          <Text className="text-sm font-semibold text-[#111111]">82K</Text>
        </Pressable>
      </View>
    </View>
  )
}
