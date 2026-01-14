import React from 'react'
import { View, Text, Modal, Pressable, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

interface MenuItem {
  label: string
  icon: string
  onPress: () => void
}

interface MenuSection {
  title: string
  items: MenuItem[]
}

interface ProfileMenuModalProps {
  visible: boolean
  onClose: () => void
  onLogout: () => void
}

export const ProfileMenuModal: React.FC<ProfileMenuModalProps> = ({
  visible,
  onClose,
  onLogout,
}) => {
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const sections: MenuSection[] = [
    {
      title: 'Basic Settings',
      items: [
        { label: 'Settings', icon: 'settings-outline', onPress: () => router.push('/settings') },
        { label: 'Language', icon: 'language-outline', onPress: () => console.log('Language') },
      ]
    },
   
    {
      title: 'About',
      items: [
        { label: 'About App', icon: 'information-circle-outline', onPress: () => console.log('About') },
        { label: 'Terms of Service', icon: 'document-text-outline', onPress: () => console.log('Terms') },
        { label: 'Privacy Policy', icon: 'lock-closed-outline', onPress: () => console.log('Privacy Policy') },
      ]
    },
    {
      title: 'Account',
      items: [
        { label: 'Logout', icon: 'log-out-outline', onPress: () => {
          onLogout()
          setTimeout(() => router.replace('/'), 100)
        }},
      ]
    }
  ]

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
            <Text className="text-lg font-bold text-gray-900">Menu</Text>
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
            {sections.map((section, sectionIndex) => (
              <View key={section.title}>
                {/* Section Title */}
                <View className="py-3">
                  <Text className="text-sm font-semibold text-gray-500">
                    {section.title}
                  </Text>
                </View>

                {/* Section Items */}
                {section.items.map((item, itemIndex) => (
                  <View key={item.label}>
                    <Pressable
                      onPress={() => {
                        item.onPress()
                        if (item.label !== 'Logout') onClose()
                      }}
                      className="flex-row items-center py-3"
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={26}
                        color={item.label === 'Logout' ? '#dc2626' : '#374151'}
                      />
                      <Text className={`text-base font-medium ml-3 flex-1 ${item.label === 'Logout' ? 'text-red-600' : 'text-gray-700'}`}>
                        {item.label}
                      </Text>
                      {item.label !== 'Logout' && (
                        <Ionicons name="chevron-forward" size={16} color="#ccc" />
                      )}
                    </Pressable>
                  </View>
                ))}

                {/* Section Divider */}
                {sectionIndex < sections.length - 1 && <View className="h-[1px] bg-gray-200 my-2" />}
              </View>
            ))}
          </ScrollView>

          {/* Footer padding for safe area */}
          <View style={{ paddingBottom: insets.bottom }} />
        </View>
      </View>
    </Modal>
  )
}