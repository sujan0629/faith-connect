import { create } from 'zustand'
import { setAccessToken, api } from '../api/axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Role, UserProfile } from '@faithconnect/shared'
import notificationService from '../lib/notificationService'

export type { Role, UserProfile }

type AuthState = {
	user?: UserProfile
	accessToken?: string
	refreshToken?: string
	rolePreference: Role
	isAuthenticated: boolean
	isHydrated: boolean
	setRolePreference: (role: Role) => void
	setAuth: (payload: { user: UserProfile; accessToken: string; refreshToken: string }) => void
	updateUser: (payload: Partial<UserProfile>) => void
	logout: () => void
	hydrate: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
	user: undefined,
	accessToken: undefined,
	refreshToken: undefined,
	rolePreference: 'worshiper',
	isAuthenticated: false,
	isHydrated: false,
	setRolePreference: (role) => set({ rolePreference: role }),
	setAuth: async ({ user, accessToken, refreshToken }) => {
		setAccessToken(accessToken)
		const state = {
			user,
			accessToken,
			refreshToken,
			isAuthenticated: true,
			rolePreference: user.role ?? get().rolePreference,
		}
		set(state)
		await AsyncStorage.setItem('auth', JSON.stringify(state)).catch(() => {})
	},
	updateUser: async (payload) => {
		const current = get().user
		if (!current) return
		const updated = { ...current, ...payload }
		set({ user: updated })
		const stored = await AsyncStorage.getItem('auth').catch(() => null)
		if (stored) {
			const parsed = JSON.parse(stored)
			parsed.user = updated
			await AsyncStorage.setItem('auth', JSON.stringify(parsed)).catch(() => {})
		}
	},
	logout: async () => {
		// Clear push notifications
		try {
			await notificationService.clearPushToken(api)
		} catch (error) {
			console.error('Error clearing push token on logout:', error)
		}

		setAccessToken(null)
		set({ user: undefined, accessToken: undefined, refreshToken: undefined, isAuthenticated: false })
		await AsyncStorage.removeItem('auth').catch(() => {})
	},
	hydrate: async () => {
		try {
			const stored = await AsyncStorage.getItem('auth')
			if (stored) {
				const parsed = JSON.parse(stored)
				if (parsed.accessToken && parsed.refreshToken && parsed.user) {
					setAccessToken(parsed.accessToken)
					set({ 
						user: parsed.user,
						accessToken: parsed.accessToken,
						refreshToken: parsed.refreshToken,
						rolePreference: parsed.rolePreference || 'worshiper',
						isAuthenticated: true, 
						isHydrated: true 
					})
					return
				}
			}
		} catch (error) {
			console.error('[AuthStore] Hydration error:', error)
		}
		set({ isHydrated: true })
	},
}))
