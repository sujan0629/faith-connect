import { useLocalSearchParams } from 'expo-router'
import { useDebouncedRouter } from '../hooks/useDebounce'
import { View, Text, Image, Pressable, ActivityIndicator } from 'react-native'
import { useAuthStore } from '../stores/authStore'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import appIcon from '../assets/images/icon.png'
import { useEffect } from 'react'
import * as ImagePicker from 'expo-image-picker'
import * as Notifications from 'expo-notifications'

export default function Landing() {
    const router = useDebouncedRouter()
    const params = useLocalSearchParams()
    const setRolePreference = useAuthStore((s) => s.setRolePreference)
    const { isAuthenticated, user, isHydrated, hydrate } = useAuthStore()
    const insets = useSafeAreaInsets()

     
    useEffect(() => {
        const init = async () => {
            await hydrate()
            
            // Request notification permissions
            try {
                const notificationPermission = await Notifications.requestPermissionsAsync()
                if (notificationPermission.status !== 'granted') {
                    console.log('Notification permission denied')
                }
            } catch (error) {
                console.error('Failed to request notification permission:', error)
            }
            
            // Request media permissions on app launch
            try {
                const cameraPermission = await ImagePicker.requestCameraPermissionsAsync()
                if (cameraPermission.status !== 'granted') {
                    console.log('Camera permission denied')
                }
                
                const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync()
                if (libraryPermission.status !== 'granted') {
                    console.log('Photo library permission denied')
                }
            } catch (error) {
                console.error('Failed to request permissions:', error)
            }
        }
        init()
    }, [])

     
    useEffect(() => {
        if (params.logout) return; // Skip redirect if just logged out
        
        if (isHydrated && isAuthenticated && user?.onboardingCompleted) {
            router.replace('/(tabs)/home')
        } else if (isHydrated && isAuthenticated && !user?.onboardingCompleted) {
            router.replace('/onboarding/profile')
        }
    }, [isHydrated, isAuthenticated, user?.onboardingCompleted, params.logout])

    if (!isHydrated) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="small" color="#111" />
            </View>
        )
    }

    return (
        <View className="flex-1 bg-white">
            <View 
                style={{ 
                    paddingTop: insets.top + 40, 
                    paddingBottom: insets.bottom + 20 
                }} 
                className="flex-1 px-6 justify-between"
            >
                {/* Top Section: Logo and Branding centered */}
                <View className="flex-1 justify-center items-center">
                    <Image 
                        source={appIcon} 
                        style={{ width: 240, height: 150 }}
                        resizeMode="contain"
                    />
                    <Text className="text-3xl font-bold text-gray-900 mt-4">FaithConnect</Text>
                    <Text className="mt-6 text-center text-sm text-gray-600">
                        A platform where Worshipers connect with their {"\n"} Religious Leaders.
                    </Text>
                </View>

                {/* Bottom Section: Buttons and Footer */}
                <View className="w-full">
                    <View className="gap-4">
                        <Pressable
                            onPress={() => {
                                setRolePreference('worshiper')
                                router.push('/auth/login')
                            }}
                            className="rounded-2xl bg-blue-500 px-6 py-4"
                        >
                            <Text className="text-center text-base font-semibold text-white">Continue as Worshiper</Text>
                        </Pressable>
                        
                        <Pressable
                            onPress={() => {
                                setRolePreference('leader')
                                router.push('/auth/login')
                            }}
                            className="rounded-2xl bg-gray-200 px-6 py-4"
                        >
                            <Text className="text-center text-base font-semibold text-gray-700">Continue as Religious Leader</Text>
                        </Pressable>
                    </View>

                    {/* Horizontal Line */}
                    <View className="h-[1px] w-full bg-gray-100 mt-10 mb-6" />

                    {/* Footer Links */}
                    <View className="px-6">
        <Text className="text-[11px] text-center leading-5">
            For any questions, please <Text className="font-semibold">visit our Help Center</Text>.
        </Text>
    </View>
                </View>
            </View>
        </View>
    )
}