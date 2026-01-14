import React, { useState } from 'react'
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { moderationApi, ReportReason, ReportedType } from '../../api/moderation'
import { SolidButton } from '../Buttons/SolidButton'

const reportReasons: { label: string; value: ReportReason }[] = [
  { label: 'Spam', value: 'spam' },
  { label: 'Harassment', value: 'harassment' },
  { label: 'Hate Speech', value: 'hate_speech' },
  { label: 'Inappropriate Content', value: 'inappropriate_content' },
  { label: 'Misinformation', value: 'misinformation' },
  { label: 'Copyright Infringement', value: 'copyright' },
  { label: 'Other', value: 'other' },
]

interface ReportModalProps {
  visible: boolean
  contentId: string
  contentType: ReportedType
  onClose: () => void
  onReportSuccess?: () => void
}

export const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  contentId,
  contentType,
  onClose,
  onReportSuccess,
}) => {
  const insets = useSafeAreaInsets()
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null)
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleReport = async () => {
    if (!selectedReason) {
      Toast.show({
        type: 'error',
        text1: 'Please select a reason',
      })
      return
    }

    try {
      setIsLoading(true)
      await moderationApi.reportContent(
        contentId,
        contentType,
        selectedReason,
        description.trim() || undefined
      )

      Toast.show({
        type: 'success',
        text1: 'Report submitted',
        text2: 'Thank you for helping us keep FaithConnect safe',
      })

      onReportSuccess?.()
      handleClose()
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to submit report',
        text2: error.message || 'Please try again',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedReason(null)
    setDescription('')
    onClose()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end">
        <Pressable
          className="absolute inset-0"
          onPress={handleClose}
        />

        {/* Bottom Sheet */}
        <View className="bg-white rounded-t-2xl max-h-[90%] shadow-sm">
          {/* Handle Bar */}
          <View className="items-center py-2">
            <View className="w-10 h-1 bg-gray-300 rounded-full" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-2 border-b border-gray-100">
            <Text className="text-lg font-bold text-gray-900">Report Content</Text>
            <Pressable onPress={handleClose} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <Ionicons name="close" size={22} color="#666" />
            </Pressable>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            className="px-6"
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Info */}
            <View className="bg-blue-50 rounded-lg p-4 mt-4 mb-6 flex-row gap-3">
              <Ionicons name="information-circle" size={20} color="#0066cc" />
              <Text className="flex-1 text-sm text-blue-900">
                Reports are reviewed by our moderation team. We take all reports
                seriously.
              </Text>
            </View>

            {/* Reason Selection */}
            <Text className="text-base font-semibold text-gray-900 mb-3">
              What&apos;s the problem?
            </Text>

            <View className="gap-2 mb-6">
              {reportReasons.map((reason) => (
                <Pressable
                  key={reason.value}
                  onPress={() => setSelectedReason(reason.value)}
                  className={`px-4 py-3 rounded-2xl border flex-row items-center gap-3 ${
                    selectedReason === reason.value
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200'
                  }`}
                >
                  <View
                    className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                      selectedReason === reason.value
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedReason === reason.value && (
                      <View className="w-3 h-3 rounded-full bg-red-500" />
                    )}
                  </View>
                  <Text
                    className={`flex-1 font-medium ${
                      selectedReason === reason.value
                        ? 'text-red-600'
                        : 'text-gray-700'
                    }`}
                  >
                    {reason.label}
                  </Text>
                </Pressable>
              ))}
            </View>


            {/* Buttons */}
            <View className="gap-3">
              <SolidButton
                label={isLoading ? '' : 'Submit Report'}
                onPress={handleReport}
                variant="blue"
                loading={isLoading}
                style={{ paddingVertical: 12 }}
              />
              <SolidButton
                label="Cancel"
                onPress={handleClose}
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

export default ReportModal
