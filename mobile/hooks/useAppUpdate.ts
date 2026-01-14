import { useState, useCallback } from 'react'
import * as Application from 'expo-application'
import * as Updates from 'expo-updates'
import VersionCheck from 'react-native-version-check'
import { Platform, Linking } from 'react-native'

export type AppUpdateStatus =
	| 'idle'
	| 'checking'
	| 'store-update-available'
	| 'ota-update-available'
	| 'up-to-date'
	| 'error'

export function useAppUpdate() {
	const [status, setStatus] = useState<AppUpdateStatus>('idle')
	const [latestVersion, setLatestVersion] = useState<string | null>(null)
	const [otaUpdateInfo, setOtaUpdateInfo] = useState<Updates.UpdateCheckResult | null>(null)
	const [error, setError] = useState<string | null>(null)

	const checkForUpdate = useCallback(async () => {
		setStatus('checking')
		setError(null)
		try {
			let storeVersion: string | null = null
			if (Platform.OS === 'android') {
				storeVersion = await VersionCheck.getLatestVersion({ provider: 'playStore' })
			} else if (Platform.OS === 'ios') {
				storeVersion = await VersionCheck.getLatestVersion({ provider: 'appStore' })
			}
			setLatestVersion(storeVersion)

			const currentVersion = Application.nativeApplicationVersion
			if (storeVersion && currentVersion && storeVersion !== currentVersion) {
				setStatus('store-update-available')
				return
			}

			const updateInfo = await Updates.checkForUpdateAsync()
			setOtaUpdateInfo(updateInfo)
			if (updateInfo.isAvailable) {
				setStatus('ota-update-available')
				return
			}
			setStatus('up-to-date')
		} catch (e) {
			let errMsg = 'Unknown error'
			if (typeof e === 'string') errMsg = e
			else if (e && typeof e === 'object' && 'message' in e) errMsg = (e as any).message
			setError(errMsg)
			setStatus('error')
		}
	}, [])

	const promptForStoreUpdate = useCallback(() => {
		if (Platform.OS === 'android') {
			Linking.openURL('market://details?id=com.faithconnect.sujan0629')
		} else if (Platform.OS === 'ios') {
			Linking.openURL('itms-apps://itunes.apple.com/app/idYOUR_APP_STORE_ID')
		}
	}, [])

	const applyOtaUpdate = useCallback(async () => {
		try {
			setStatus('checking')
			await Updates.fetchUpdateAsync()
			await Updates.reloadAsync()
		} catch (e) {
			let errMsg = 'Failed to apply OTA update'
			if (typeof e === 'string') errMsg = e
			else if (e && typeof e === 'object' && 'message' in e) errMsg = (e as any).message
			setError(errMsg)
			setStatus('error')
		}
	}, [])

	return {
		status,
		latestVersion,
		otaUpdateInfo,
		error,
		checkForUpdate,
		promptForStoreUpdate,
		applyOtaUpdate,
	}
}
