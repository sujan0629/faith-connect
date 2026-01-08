import type { ComponentProps, ComponentType } from 'react'
import type { TextStyle, ViewStyle } from 'react-native'
import { Text, View } from 'react-native'
import { BaseToast, ErrorToast } from 'react-native-toast-message'
import type { BaseToastProps, ToastConfig } from 'react-native-toast-message'

const ViewWithClassName = View as unknown as ComponentType<
	ComponentProps<typeof View> & { className?: string }
>
const TextWithClassName = Text as unknown as ComponentType<
	ComponentProps<typeof Text> & { className?: string }
>

const baseToastStyle: ViewStyle = {
	borderLeftWidth: 6,
	borderRadius: 12,
	paddingVertical: 12,
	paddingHorizontal: 12,
	backgroundColor: '#0B1220',
}

const text1Style: TextStyle = { fontSize: 15, fontWeight: '600', color: '#F6F8FF' }
const text2Style: TextStyle = { fontSize: 13, color: '#CBD4E6' }

export const toastConfig: ToastConfig = {
	success: (props: BaseToastProps) => (
		<BaseToast
			{...props}
			style={[baseToastStyle, { borderLeftColor: '#38bdf8' }]}
			contentContainerStyle={{ paddingHorizontal: 8 }}
			text1Style={text1Style}
			text2Style={text2Style}
		/>
	),
	info: (props: BaseToastProps) => (
		<BaseToast
			{...props}
			style={[baseToastStyle, { borderLeftColor: '#a855f7' }]}
			contentContainerStyle={{ paddingHorizontal: 8 }}
			text1Style={text1Style}
			text2Style={text2Style}
		/>
	),
	error: (props: BaseToastProps) => (
		<ErrorToast
			{...props}
			style={[baseToastStyle, { borderLeftColor: '#ef4444' }]}
			contentContainerStyle={{ paddingHorizontal: 8 }}
			text1Style={{ ...text1Style, color: '#FFECEC' }}
			text2Style={{ ...text2Style, color: '#FCA5A5' }}
		/>
	),
	minimal: ({ text1 }: BaseToastProps) => (
		<ViewWithClassName className="rounded-xl bg-black/80 px-4 py-3">
			<TextWithClassName className="text-sm font-semibold text-white">{text1}</TextWithClassName>
		</ViewWithClassName>
	),
}
