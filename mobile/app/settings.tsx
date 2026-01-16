import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, Switch, Pressable, ActivityIndicator } from 'react-native'
import { useDebouncedRouter } from '../hooks/useDebounce'
import { Ionicons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { SafeAreaView } from 'react-native-safe-area-context'
import { UserSettings } from '../api/settings'
import { useAppUpdate } from '../hooks/useAppUpdate'
import { toastConfig } from '../components/ToastConfig'
import { SolidButton } from '../components/Buttons/SolidButton'
import { useSettingsStore } from '../stores/settingsStore'

export default function SettingsScreen() {
  const router = useDebouncedRouter()
  const { settings, isLoading, fetchSettings, updateSettings } = useSettingsStore()
  const [isSaving, setIsSaving] = useState(false)
  const [localSettings, setLocalSettings] = useState<UserSettings | null>(null)
  const { status, checkForUpdate, applyOtaUpdate, error } = useAppUpdate()

   
  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings)
    }
  }, [settings])

  const handleToggle = (key: keyof UserSettings, value: boolean) => {
    if (localSettings) {
      setLocalSettings({
        ...localSettings,
        [key]: value,
      })
    }
  }

  const handleWhoCanLikeChange = (value: string) => {
    if (localSettings) {
      setLocalSettings({
        ...localSettings,
        whoCanLike: value as any,
      })
    }
  }


  const handleSave = async () => {
    if (!localSettings) return

    try {
      setIsSaving(true)
      await updateSettings(localSettings)
      Toast.show({
        type: 'success',
        text1: 'Settings saved',
        text2: 'Your preferences have been updated',
      })
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to save settings',
        text2: error.message || 'Please try again',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#222" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top'] as const}>
      {/* Header */}
      <View className="flex-row items-center justify-center px-6 py-4 bg-white border-b border-gray-100">
        <Pressable onPress={() => router.back()} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }} className="absolute left-6">
          <Ionicons name="chevron-back" size={24} color="#111" />
        </Pressable>
        <Text className="text-xl font-bold text-gray-900 text-center">Settings</Text>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Notifications Section */}
        <View className="bg-white mt-3">
          <View className="px-6 py-3 border-b border-gray-100">
            <Text className="text-sm font-semibold text-gray-500 uppercase">
              Notifications
            </Text>
          </View>

          <View className="px-6">
            <View className="py-4 border-b border-gray-100 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  In-App Notifications
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Receive notifications within the app
                </Text>
              </View>
              {localSettings && (
                <Switch
                  value={localSettings.notificationsEnabled}
                  onValueChange={(val) =>
                    handleToggle('notificationsEnabled', val)
                  }
                  trackColor={{ false: '#ccc', true: '#3b82f6' }}
                />
              )}
            </View>

            <View className="py-4 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  Email Notifications
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Receive email updates
                </Text>
              </View>
              {localSettings && (
                <Switch
                  value={localSettings.emailNotificationsEnabled}
                  onValueChange={(val) =>
                    handleToggle('emailNotificationsEnabled', val)
                  }
                  trackColor={{ false: '#ccc', true: '#3b82f6' }}
                />
              )}
            </View>
          </View>
        </View>

        {/* Privacy Section */}
        <View className="bg-white mt-3">
          <View className="px-6 py-3 border-b border-gray-100">
            <Text className="text-sm font-semibold text-gray-500 uppercase">
              Privacy
            </Text>
          </View>

          <View className="px-6">
            <View className="py-4 border-b border-gray-100 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  Private Profile
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Only approved followers can see your profile
                </Text>
              </View>
              {localSettings && (
                <Switch
                  value={localSettings.privateProfile}
                  onValueChange={(val) =>
                    handleToggle('privateProfile', val)
                  }
                  trackColor={{ false: '#ccc', true: '#3b82f6' }}
                />
              )}
            </View>

            <View className="py-4 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  Allow Messages from Anyone
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Only followers can message you if off
                </Text>
              </View>
              {localSettings && (
                <Switch
                  value={localSettings.allowMessagesFromAnyone}
                  onValueChange={(val) =>
                    handleToggle('allowMessagesFromAnyone', val)
                  }
                  trackColor={{ false: '#ccc', true: '#3b82f6' }}
                />
              )}
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View className="bg-white mt-3">
          <View className="px-6 py-3 border-b border-gray-100">
            <Text className="text-sm font-semibold text-gray-500 uppercase">
              Content
            </Text>
          </View>

          <View className="px-6">
            <View className="py-4 border-b border-gray-100 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  Allow Comments
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Let others comment on your posts
                </Text>
              </View>
              {localSettings && (
                <Switch
                  value={localSettings.allowComments}
                  onValueChange={(val) =>
                    handleToggle('allowComments', val)
                  }
                  trackColor={{ false: '#ccc', true: '#3b82f6' }}
                />
              )}
            </View>

            <View className="py-4">
              <Text className="text-base font-medium text-gray-900 mb-4">
                Who Can Like Your Posts
              </Text>
              {localSettings && (
                <View className="gap-2">
                  {(['everyone', 'followers_only', 'friends_only'] as const).map(
                    (option) => (
                      <Pressable
                        key={option}
                        onPress={() => handleWhoCanLikeChange(option)}
                        className={`px-4 py-4 mt-2 rounded-xl border flex-row items-center ${
                          localSettings.whoCanLike === option
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <View className={`w-5 h-5 rounded-full border-2 mr-3 ${
                          localSettings.whoCanLike === option
                            ? 'border-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {localSettings.whoCanLike === option && (
                            <View className="flex-1 items-center justify-center">
                              <View className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                            </View>
                          )}
                        </View>
                        <Text
                          className={`font-medium capitalize ${
                            localSettings.whoCanLike === option
                              ? 'text-blue-600'
                              : 'text-gray-700'
                          }`}
                        >
                          {option.replace('_', ' ')}
                        </Text>
                      </Pressable>
                    )
                  )}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* App Updates Section */}
        <View className="bg-white mt-3">
          <View className="px-6 py-3 border-b border-gray-100">
            <Text className="text-sm font-semibold text-gray-500 uppercase">
              App Updates
            </Text>
          </View>

          <View className="px-6 py-4">
            <Text className="text-base font-medium text-gray-900 mb-2">Check for Updates</Text>
            <Text className="text-sm text-gray-600 mb-4">
              Status: {status === 'ota-update-available' ? 'Update available' : 
                       status === 'up-to-date' ? 'Up to date' : 
                       status === 'checking' ? 'Checking...' : 
                       status === 'error' ? `Error: ${error}` : 'Tap to check'}
            </Text>
            
            <View className="flex-row gap-3">
              <Pressable
                onPress={checkForUpdate}
                disabled={status === 'checking'}
                className="flex-1 bg-blue-500 px-4 py-3 rounded-xl items-center"
              >
                <Text className="text-white font-semibold">
                  {status === 'checking' ? 'Checking...' : 'Check for Updates'}
                </Text>
              </Pressable>
              
              {status === 'ota-update-available' && (
                <Pressable
                  onPress={applyOtaUpdate}
                  className="flex-1 bg-green-500 px-4 py-3 rounded-xl items-center"
                >
                  <Text className="text-white font-semibold">Apply Update</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {/* Navigation style moved to Profile menu */}

        {/* Save Button */}
        <View className="px-6 py-6">
          <SolidButton
            label="Save Settings"
            onPress={handleSave}
            variant="blue"
            loading={isSaving}
            style={{ paddingVertical: 14 }}
          />
        </View>
      </ScrollView>

      <Toast config={toastConfig} />
    </SafeAreaView>
  )
}
