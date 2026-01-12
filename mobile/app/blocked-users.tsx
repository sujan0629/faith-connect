import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
  SafeAreaView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { moderationApi } from '../api/moderation'
import { toastConfig } from '../components/ToastConfig'

interface BlockedUser {
  id: string
  name: string
  avatar?: string
}

export default function BlockedUsersScreen() {
  const router = useRouter()
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [unblockingId, setUnblockingId] = useState<string | null>(null)

  useEffect(() => {
    loadBlockedUsers()
  }, [])

  const loadBlockedUsers = async () => {
    try {
      setIsLoading(true)
      const users = await moderationApi.getBlockedUsers()
      setBlockedUsers(users || [])
    } catch (error: any) {
      console.error('Failed to load blocked users:', error)
      Toast.show({
        type: 'error',
        text1: 'Failed to load blocked users',
        text2: error.message || 'Please try again',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnblock = async (userId: string, userName: string) => {
    try {
      setUnblockingId(userId)
      await moderationApi.unblockUser(userId)
      setBlockedUsers(blockedUsers.filter((u) => u.id !== userId))
      Toast.show({
        type: 'success',
        text1: 'User unblocked',
        text2: `You can now see content from ${userName}`,
      })
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to unblock user',
        text2: error.message || 'Please try again',
      })
    } finally {
      setUnblockingId(null)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-4 py-4 flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#111" />
          </Pressable>
          <Text className="text-lg font-bold text-gray-800 flex-1">
            Blocked Users
          </Text>
        </View>

        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#0099ff" />
          </View>
        ) : blockedUsers.length === 0 ? (
          <View className="flex-1 justify-center items-center px-4">
            <Ionicons name="checkmark-circle" size={48} color="#ccc" />
            <Text className="text-lg font-semibold text-gray-800 mt-4">
              No blocked users
            </Text>
            <Text className="text-center text-gray-600 mt-2">
              You haven't blocked anyone yet
            </Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {blockedUsers.map((user) => (
              <View
                key={user.id}
                className="bg-white px-4 py-3 border-b border-gray-100 flex-row items-center justify-between"
              >
                {/* User Info */}
                <View className="flex-1 flex-row items-center gap-3">
                  <Image
                    source={{
                      uri: user.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cmFuZG9tJTIwcGVvcGxlfGVufDB8fDB8fHww',
                    }}
                    className="w-12 h-12 rounded-full bg-gray-200"
                  />
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                      {user.name}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      @{user.id.slice(0, 8)}
                    </Text>
                  </View>
                </View>

                {/* Unblock Button */}
                <Pressable
                  onPress={() => handleUnblock(user.id, user.name)}
                  disabled={unblockingId === user.id}
                  className="ml-3"
                >
                  {unblockingId === user.id ? (
                    <ActivityIndicator color="#666" />
                  ) : (
                    <View className="px-4 py-2 rounded-lg border border-gray-300">
                      <Text className="text-sm font-medium text-gray-700">
                        Unblock
                      </Text>
                    </View>
                  )}
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <Toast config={toastConfig} />
    </SafeAreaView>
  )
}
