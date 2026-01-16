import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useFeedStore, Post } from '../../stores/feedStore'
import { BarChart, PieChart } from 'react-native-gifted-charts'
import { VideoView, useVideoPlayer } from 'expo-video'

interface PostMetrics {
  totalPosts: number
  totalEngagement: number
  avgEngagementPerPost: number
  totalImpressions: number
  topPostTitle: string
  topPostEngagement: number
}

interface AccountMetrics {
  followers: number
  following: number
  totalLikes: number
  totalSaves: number
  totalComments: number
}

// Reel Thumbnail Component
const ReelThumbnail = ({ item, onPress }: { item: Post; onPress: () => void }) => {
  const player = useVideoPlayer(item.media || '', (player) => {
    player.muted = true
    player.play()
  })

  const engagement = item.likes + item.comments + item.saves

  return (
    <Pressable onPress={onPress} className="relative">
      <View className="w-32 h-52 rounded-2xl overflow-hidden bg-black">
        {item.media ? (
          <VideoView
            player={player}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            pointerEvents="none"
          />
        ) : (
          <View className="flex-1 items-center justify-center bg-gray-300">
            <Ionicons name="play" size={32} color="#666666" />
          </View>
        )}
        {/* Engagement overlay */}
        <View className="absolute bottom-3 left-0 right-0 items-center">
          <View className="bg-black/70 rounded-full px-4 py-2">
            <Text className="text-white font-bold text-lg">{engagement}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  )
}

export default function LeaderDashboard() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { explore } = useFeedStore()
  const [isLoading, setIsLoading] = useState(true)
  const [postMetrics, setPostMetrics] = useState<PostMetrics | null>(null)
  const [accountMetrics, setAccountMetrics] = useState<AccountMetrics | null>(null)
  const [topReels, setTopReels] = useState<Post[]>([])

   
  useEffect(() => {
    // Calculate metrics from posts
    calculateMetrics()
  }, [explore])

  const calculateMetrics = () => {
    try {
      // Filter user's posts and reels
      const userPosts = explore.filter((p) => p.authorId === user?.id && p.type === 'post')
      // Get reels (type === 'reel') OR video posts (type === 'post' && mediaType === 'video')
      const userReels = explore.filter((p) => p.authorId === user?.id && (p.type === 'reel' || (p.type === 'post' && p.mediaType === 'video'))).sort(
        (a, b) => (b.likes + b.comments + b.saves) - (a.likes + a.comments + a.saves)
      )

      if (userPosts.length === 0) {
        setPostMetrics({
          totalPosts: 0,
          totalEngagement: 0,
          avgEngagementPerPost: 0,
          totalImpressions: 0,
          topPostTitle: 'No posts yet',
          topPostEngagement: 0,
        })
        setAccountMetrics({
          followers: user?.followers?.length || 0,
          following: user?.following?.length || 0,
          totalLikes: 0,
          totalSaves: 0,
          totalComments: 0,
        })
        setTopReels(userReels.slice(0, 5))
        setIsLoading(false)
        return
      }

      // Calculate post metrics
      const totalEngagement = userPosts.reduce(
        (sum, p) => sum + p.likes + p.comments + p.saves,
        0,
      )
      const totalImpressions = userPosts.reduce((sum, p) => sum + p.impressions, 0)
      const avgEngagement = userPosts.length > 0 ? totalEngagement / userPosts.length : 0
      const totalLikes = userPosts.reduce((sum, p) => sum + p.likes, 0)
      const totalSaves = userPosts.reduce((sum, p) => sum + p.saves, 0)
      const totalComments = userPosts.reduce((sum, p) => sum + p.comments, 0)

      // Find top post
      const topPost = userPosts.reduce((max, p) =>
        p.likes + p.comments + p.saves > max.likes + max.comments + max.saves ? p : max,
      )

      setPostMetrics({
        totalPosts: userPosts.length,
        totalEngagement,
        avgEngagementPerPost: avgEngagement,
        totalImpressions,
        topPostTitle: topPost.title || 'Untitled',
        topPostEngagement: topPost.likes + topPost.comments + topPost.saves,
      })

      setAccountMetrics({
        followers: user?.followers?.length || 0,
        following: user?.following?.length || 0,
        totalLikes,
        totalSaves,
        totalComments,
      })

      // Store top reels for display
      setTopReels(userReels.slice(0, 5))

      setIsLoading(false)
    } catch (error) {
      console.error('Error calculating metrics:', error)
      setIsLoading(false)
    }
  }

  // Prepare chart data
  const engagementChartData = [
    { 
      value: accountMetrics?.totalLikes || 0, 
      label: 'Likes', 
      labelWidth: 40, 
      color: '#111111',
      topLabelComponent: () => (
        <View style={{ marginBottom: 4 }}>
          <Text style={{ color: '#111111', fontSize: 10, fontWeight: 'bold' }}>
            {accountMetrics?.totalLikes || 0}
          </Text>
        </View>
      )
    },
    {
      value: accountMetrics?.totalComments || 0,
      label: 'Comments',
      labelWidth: 50,
      color: '#111111',
      topLabelComponent: () => (
        <View style={{ marginBottom: 4 }}>
          <Text style={{ color: '#111111', fontSize: 10, fontWeight: 'bold' }}>
            {accountMetrics?.totalComments || 0}
          </Text>
        </View>
      )
    },
    { 
      value: accountMetrics?.totalSaves || 0, 
      label: 'Saves', 
      labelWidth: 40, 
      color: '#111111',
      topLabelComponent: () => (
        <View style={{ marginBottom: 4 }}>
          <Text style={{ color: '#111111', fontSize: 10, fontWeight: 'bold' }}>
            {accountMetrics?.totalSaves || 0}
          </Text>
        </View>
      )
    },
  ]

  const followersData = [
    {
      value: accountMetrics?.followers || 0,
      label: 'Followers',
      labelWidth: 60,
      color: '#666666',
      topLabelComponent: () => (
        <View style={{ marginBottom: 4 }}>
          <Text style={{ color: '#111111', fontSize: 10, fontWeight: 'bold' }}>
            {accountMetrics?.followers || 0}
          </Text>
        </View>
      )
    },
    {
      value: accountMetrics?.following || 0,
      label: 'Following',
      labelWidth: 60,
      color: '#999999',
      topLabelComponent: () => (
        <View style={{ marginBottom: 4 }}>
          <Text style={{ color: '#111111', fontSize: 10, fontWeight: 'bold' }}>
            {accountMetrics?.following || 0}
          </Text>
        </View>
      )
    },
  ]

  const engagementPieData = [
    {
      value: accountMetrics?.totalLikes || 1,
      color: '#111',
      text: 'Likes',
    },
    {
      value: accountMetrics?.totalComments || 1,
      color: '#666',
      text: 'Comments',
    },
    {
      value: accountMetrics?.totalSaves || 1,
      color: '#ccc',
      text: 'Saves',
    },
  ]

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-[#f0f0f0]">
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#111111" />
        </Pressable>
        <Text className="font-bold text-xl text-[#111111]">Leader&apos;s Dashboard</Text>
        <View className="w-6" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Overview Cards */}
        <View className="px-5 pt-4 pb-2">
          <Text className="font-semibold text-[#111111] mb-3">Overview</Text>
          <View className="flex-row justify-between mb-3 gap-2">
            <View className="flex-1 bg-white rounded-2xl p-3 border border-[#f0f0f0]">
              <Text className="text-[#999999] text-xs font-medium mb-1">Total Posts</Text>
              <Text className="text-2xl font-bold text-[#111111]">{postMetrics?.totalPosts}</Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl p-3 border border-[#f0f0f0]">
              <Text className="text-[#999999] text-xs font-medium mb-1">Total Engagement</Text>
              <Text className="text-2xl font-bold text-[#111111]">
                {postMetrics?.totalEngagement}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between gap-2">
            <View className="flex-1 bg-white rounded-2xl p-3 border border-[#f0f0f0]">
              <Text className="text-[#999999] text-xs font-medium mb-1">Impressions</Text>
              <Text className="text-2xl font-bold text-[#111111]">
                {postMetrics?.totalImpressions}
              </Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl p-3 border border-[#f0f0f0]">
              <Text className="text-[#999999] text-xs font-medium mb-1">Avg/Post</Text>
              <Text className="text-2xl font-bold text-[#111111]">
                {Math.round(postMetrics?.avgEngagementPerPost || 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Top Performing Reels */}
        {topReels.length > 0 && (
          <View className="px-5 py-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="font-semibold text-[#111111]">Top Performing</Text>
              <Pressable onPress={() => router.push('/reels')}>
                <Text className="text-[#007AFF] text-sm font-semibold">See all</Text>
              </Pressable>
            </View>
            <ScrollView
              horizontal
              scrollEventThrottle={16}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {topReels.slice(0, 5).map((reel, idx) => (
                <View key={reel.id} className={idx > 0 ? 'ml-3' : ''}>
                  <ReelThumbnail item={reel} onPress={() => router.push(`/reels?reelId=${reel.id}`)} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Engagement Breakdown */}
        <View className="px-5 py-4">
          <Text className="font-semibold text-[#111111] mb-3">Engagement</Text>
          <View className="bg-white rounded-2xl p-4 border border-[#f0f0f0] relative">
            {engagementChartData.length > 0 && (
              <BarChart
                data={engagementChartData}
                barWidth={40}
                spacing={30}
                height={220}
                yAxisLabelWidth={35}
                noOfSections={5}
                backgroundColor="#ffffff"
                rulesType="dotted"
                xAxisLabelTextStyle={{ fontSize: 12, marginTop: 4, color: '#666666' }}
                yAxisTextStyle={{ fontWeight: 'semibold', color: '#111111', fontSize: 13 }}
              />
            )}
          </View>
        </View>


       
   {/* Engagement Pie Chart */}
        <View className="px-5 py-4">
          <Text className="font-semibold text-[#111111] mb-3">Distribution</Text>
          <View className="bg-white rounded-2xl p-4 border border-[#f0f0f0] items-center">
            {engagementPieData.length > 0 && (
              <>
                <PieChart
                  data={engagementPieData}
                  donut
                  radius={80}
                  innerRadius={55}
                  centerLabelComponent={() => (
                    <View className="items-center">
                      <Text className="text-lg font-bold text-[#111111]">
                        {accountMetrics?.totalLikes}
                      </Text>
                      <Text className="text-xs text-[#999999]">total</Text>
                    </View>
                  )}
                />
                <View className="flex-row justify-center flex-wrap mt-5 gap-4">
                  {engagementPieData.map((item, idx) => (
                    <View key={idx} className="flex-row items-center">
                      <View
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: item.color }}
                      />
                      <Text className="text-xs text-[#666666]">{item.text}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        </View>
 {/* Followers Section */}
        <View className="px-5 py-4">
          <Text className="font-semibold text-[#111111] mb-3">Community</Text>
          <View className="bg-white rounded-2xl p-4 border border-[#f0f0f0]">
            <BarChart
              data={followersData}
              barWidth={40}
              height={200}
              spacing={40}

              yAxisLabelWidth={40}
              noOfSections={4}
              backgroundColor="#ffffff"
                rulesType="dotted"
                xAxisLabelTextStyle={{ fontSize: 12, marginTop: 4, color: '#666666' }}
                                yAxisTextStyle={{ fontWeight: 'semibold', color: '#111111', fontSize: 12 }}

            />
          </View>
        </View>
     

        {/* Footer Spacing */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  )
}
