import { Text, View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import type { BaseToastProps, ToastConfig } from 'react-native-toast-message'

export const toastConfig: ToastConfig = {
	success: (props: BaseToastProps) => (
			<View style={styles.toastContainer}>
				<BlurView intensity={80} tint="light" style={styles.blurView}>
					<View style={styles.contentWrapper}>
						<View style={styles.mainRow}>
							{/* Left Icon - Checkmark for success */}
							<Ionicons name="checkmark-circle" size={26} color="#222" style={styles.rightIcon} />
							{/* Text Content */}
							<View style={styles.textContainer}>
								<Text style={styles.titleText} numberOfLines={2}>
									{props.text1}
								</Text>
								{props.text2 && (
									<Text style={styles.subtitleText} numberOfLines={1}>
										{props.text2}
									</Text>
								)}
							</View>
						</View>
						{/* Bottom Progress Bar */}
						<View style={styles.progressBarWrapper}>
							<View style={styles.progressBar} />
						</View>
					</View>
				</BlurView>
			</View>
		),
	info: (props: BaseToastProps) => (
			<View style={styles.toastContainer}>
				<BlurView intensity={80} tint="light" style={styles.blurView}>
					<View style={styles.contentWrapper}>
						<View style={styles.mainRow}>
							{/* Left Icon - Info icon */}
							<Ionicons name="information-circle-outline" size={28} color="#222" style={styles.rightIcon} />
							{/* Text Content */}
							<View style={styles.textContainer}>
								<Text style={styles.titleText} numberOfLines={2}>
									{props.text1}
								</Text>
								{props.text2 && (
									<Text style={styles.subtitleText} numberOfLines={1}>
										{props.text2}
									</Text>
								)}
							</View>
						</View>
						{/* Bottom Progress Bar */}
						<View style={styles.progressBarWrapper}>
							<View style={styles.progressBar} />
						</View>
					</View>
				</BlurView>
			</View>
		),
	error: (props: BaseToastProps) => (
			<View style={styles.toastContainer}>
				<BlurView intensity={80} tint="light" style={styles.blurView}>
					<View style={styles.contentWrapper}>
						<View style={styles.mainRow}>
							{/* Left Icon - Close/X icon for error */}
							<Ionicons name="close-circle-outline" size={28} color="#8B0000" style={styles.rightIcon} />
							{/* Text Content */}
							<View style={styles.textContainer}>
								<Text style={styles.titleText} numberOfLines={2}>
									{props.text1}
								</Text>
								{props.text2 && (
									<Text style={styles.subtitleText} numberOfLines={1}>
										{props.text2}
									</Text>
								)}
							</View>
						</View>
						{/* Bottom Progress Bar */}
						<View style={styles.progressBarWrapper}>
							<View style={styles.progressBar} />
						</View>
					</View>
				</BlurView>
			</View>
		),
	minimal: ({ text1 }: BaseToastProps) => (
			<View style={styles.toastContainer}>
				<BlurView intensity={80} tint="light" style={styles.blurView}>
					<View style={styles.contentWrapper}>
						<View style={styles.mainRow}>
							{/* Left Icon - Smiley for minimal */}
							<Ionicons name="happy-outline" size={28} color="#6b7280" style={styles.rightIcon} />
							{/* Text Content */}
							<View style={styles.textContainer}>
								<Text style={styles.titleText} numberOfLines={2}>
									{text1}
								</Text>
							</View>
						</View>
						{/* Bottom Progress Bar */}
						<View style={styles.progressBarWrapper}>
							<View style={styles.progressBar} />
						</View>
					</View>
				</BlurView>
			</View>
		),
}

const styles = StyleSheet.create({
	toastContainer: {
		width: '100%',
		paddingHorizontal: 16,
		marginBottom: 8,
		marginTop: 15,
	},
	blurView: {
		borderRadius: 20,
		overflow: 'hidden',
	},
	contentWrapper: {
		backgroundColor: 'rgba(255, 255, 255, 0.85)',
		paddingHorizontal: 12,
		paddingVertical: 10,
	},
	   mainRow: {
		   flexDirection: 'row',
		   alignItems: 'center',
		   gap: 4,
	   },
	iconCircle: {
		width: 42,
		height: 42,
		borderRadius: 21,
		backgroundColor: '#ffffff',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 10,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	appIcon: {
		width: 28,
		height: 28,
		borderRadius: 14,
	},
	textContainer: {
		flex: 1,
		marginRight: 10,
	},
	titleText: {
		fontSize: 14,
		fontWeight: '600',
		color: '#000000',
		lineHeight: 18,
		marginTop: 4,
	},
	subtitleText: {
		fontSize: 12,
		color: '#6b7280',
		marginTop: 1,
		lineHeight: 16,
	},
	   rightIcon: {
		   marginLeft: 2,
		   marginRight: 8,
		   marginBottom: 6,
	   },
	progressBarWrapper: {
		alignItems: 'center',
		marginTop: 10,
	},
	progressBar: {
		width: 50,
		height: 3,
		backgroundColor: '#e5e7eb',
		borderRadius: 2,
	},
})
