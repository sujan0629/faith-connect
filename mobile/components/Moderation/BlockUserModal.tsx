import React, { useState } from 'react'
import {
  View,
  Text,
  Modal,
  Pressable,
  Image,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { moderationApi } from '../../api/moderation'
import { SolidButton } from '../Buttons/SolidButton'

interface BlockUserModalProps {
  visible: boolean
  userId: string
  userName: string
  userAvatar?: string
  isBlocked: boolean
  onClose: () => void
  onBlockSuccess?: () => void
}

export const BlockUserModal: React.FC<BlockUserModalProps> = ({
  visible,
  userId,
  userName,
  userAvatar,
  isBlocked,
  onClose,
  onBlockSuccess,
}) => {
  const insets = useSafeAreaInsets()
  const [isLoading, setIsLoading] = useState(false)

  const handleBlockToggle = async () => {
    try {
      setIsLoading(true)

      if (isBlocked) {
        await moderationApi.unblockUser(userId)
        Toast.show({
          type: 'success',
          text1: 'User unblocked',
          text2: `You can now see content from ${userName}`,
        })
      } else {
        await moderationApi.blockUser(userId)
        Toast.show({
          type: 'success',
          text1: 'User blocked',
          text2: `You won't see content from ${userName} anymore`,
        })
      }

      onBlockSuccess?.()
      onClose()
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: isBlocked ? 'Failed to unblock user' : 'Failed to block user',
        text2: error.message || 'Please try again',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Pressable
          className="absolute inset-0"
          onPress={onClose}
        />

        {/* Bottom Sheet */}
        <View className="bg-white rounded-t-2xl max-h-[85%] shadow-sm">
          {/* Handle Bar */}
          <View className="items-center py-2">
            <View className="w-10 h-1 bg-gray-300 rounded-full" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-2 border-b border-gray-100">
            <Text className="text-lg font-bold text-gray-900">Block User</Text>
            <Pressable onPress={onClose} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <Ionicons name="close" size={22} color="#666" />
            </Pressable>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            className="px-6"
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Icon */}
            <View className="items-center mb-6 pt-4">
              <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-3">
                <Ionicons name={isBlocked ? 'person-add-outline' : 'ban'} size={32} color="#ef4444" />
              </View>

              {/* User Info */}
              {userAvatar && (
                <Image
                  source={{ uri: userAvatar }}
                  className="w-12 h-12 rounded-full mb-2"
                />
              )}
              <Text className="text-lg font-bold text-gray-900">{userName}</Text>
            </View>

            {/* Message */}
            <Text className="text-base text-gray-700 text-center mb-6">
              {isBlocked
                ? `Unblock ${userName}? You'll be able to see their content again.`
                : `Block ${userName}? You won't see their posts, and they won't be able to find your profile or message you.`}
            </Text>

            {/* Buttons */}
            <View className="gap-3">
              <SolidButton
                label={isLoading ? '' : (isBlocked ? 'Unblock User' : 'Block User')}
                onPress={handleBlockToggle}
                variant="red"
                loading={isLoading}
                style={{ paddingVertical: 12 }}
              />
              <SolidButton
                label="Cancel"
                onPress={onClose}
                variant="secondary"
                style={{ paddingVertical: 12 }}

              />
            </View>
          </ScrollView>

          {/* Footer padding for safe area */}
          <View style={{ paddingBottom: insets.bottom }} />
        </View>
      </View>
    </Modal>
  )
}

export default BlockUserModal
