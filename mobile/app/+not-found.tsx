import { Link } from 'expo-router'
import { View, Text, Pressable } from 'react-native'

export default function NotFoundScreen() {
	return (
		<View className="flex-1 items-center justify-center bg-[#050914] px-6">
			<Text className="text-2xl font-bold text-white">Page not found</Text>
			<Text className="mt-2 text-center text-sm text-slate-400">
				The screen you are trying to open doesn’t exist.
			</Text>
			<Link href="/" asChild>
				<Pressable className="mt-6 rounded-2xl bg-cyan-500 px-5 py-3">
					<Text className="text-base font-semibold text-white">Go to Home</Text>
				</Pressable>
			</Link>
		</View>
	)
}
