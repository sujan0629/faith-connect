import { Link } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { View, Text, Image, Pressable } from 'react-native'
import { useAuthStore } from '../stores/authStore'

const roles = [
	{
		key: 'worshiper' as const,
		title: 'Continue as Worshiper',
		blurb: 'Follow leaders, learn, and stay inspired.',
	},
	{
		key: 'leader' as const,
		title: 'Continue as Religious Leader',
		blurb: 'Share guidance, posts, and reels with your community.',
	},
]

export default function Landing() {
	const setRolePreference = useAuthStore((s) => s.setRolePreference)

	return (
		<LinearGradient style={{ flex: 1 }} colors={['#0B1220', '#0F172A', '#0B1220']} className="flex-1">
			<View className="flex-1 px-6 pb-10 pt-16">
				<Text className="text-3xl font-bold text-white">FaithConnect</Text>
				<Text className="mt-3 text-base text-slate-300">
					A platform where Worshipers connect with their Religious Leaders.
				</Text>

				<View className="mt-12 items-center">
					<View className="h-44 w-full overflow-hidden rounded-3xl border border-white/5 bg-white/5">
						<LinearGradient
							colors={["#1E3A8A", "#0EA5E9"]}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
							className="absolute inset-0 opacity-70"
						/>
						<View className="absolute bottom-4 left-4 right-4">
							<Text className="text-lg font-semibold text-white">Connect. Learn. Grow.</Text>
							<Text className="mt-1 text-sm text-slate-200">
								Join a calm, respectful space for spiritual content, reels, and conversations.
							</Text>
						</View>
					</View>
				</View>

				<View className="mt-12 space-y-4">
					{roles.map((role) => (
						<Link
							key={role.key}
							href="/auth/login"
							asChild
							onPress={() => setRolePreference(role.key)}
						>
							<Pressable className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
								<Text className="text-base font-semibold text-white">{role.title}</Text>
								<Text className="mt-1 text-sm text-slate-300">{role.blurb}</Text>
							</Pressable>
						</Link>
					))}
				</View>

				<View className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
					<Text className="text-sm text-slate-300">
						Build a focused prototype: feeds, reels, follow, messaging, and notifications are ready to explore.
					</Text>
				</View>
			</View>
		</LinearGradient>
	)
}
