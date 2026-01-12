import React from 'react'
import { View, Text, Modal, Pressable, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface CommentActionModalProps {
  visible: boolean
  onClose: () => void
  onReport: () => void
  onBlock: () => void
}

export const CommentActionModal: React.FC<CommentActionModalProps> = ({
  visible,
  onClose,
  onReport,
  onBlock,
}) => {
  const insets = useSafeAreaInsets()

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
        <View className="bg-white rounded-t-2xl max-h-[40%] shadow-sm">
          {/* Handle Bar */}
          <View className="items-center py-2">
            <View className="w-10 h-1 bg-gray-300 rounded-full" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-2 border-b border-gray-100">
            <Text className="text-lg font-bold text-gray-900">Options</Text>
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
            <Pressable
              onPress={onReport}
              className="py-4 flex-row items-center gap-4"
            >
              <Ionicons name="flag" size={22} color="#222" />
              <Text className="text-base font-semibold text-black">Report Comment</Text>
            </Pressable>
            <View className="h-[1px] bg-gray-200 my-2" />
            <Pressable
              onPress={onBlock}
              className="py-4 flex-row items-center gap-4"
            >
              <Ionicons name="ban" size={22} color="#222" />
              <Text className="text-base font-semibold text-black">Block User</Text>
            </Pressable>
          </ScrollView>

          {/* Footer padding for safe area */}
          <View style={{ paddingBottom: insets.bottom }} />
        </View>
      </View>
    </Modal>
  )
}
