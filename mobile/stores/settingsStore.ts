import { create } from 'zustand'
import { settingsApi, UserSettings } from '../api/settings'
import AsyncStorage from '@react-native-async-storage/async-storage'

type SettingsStore = {
  settings: UserSettings | null
  isLoading: boolean
  error: string | null
  fetchSettings: () => Promise<void>
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>
  setSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void
}

const defaultSettings: UserSettings = {
  notificationsEnabled: true,
  emailNotificationsEnabled: true,
  allowMessagesFromAnyone: true,
  privateProfile: false,
  allowComments: true,
  whoCanLike: 'everyone',
  blockedContentTopics: [],
  navigationStyle: 'simple',
}

const NAV_KEY = 'fc_navigationStyle'

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: defaultSettings,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null })
    try {
      const settings = await settingsApi.getSettings()
      // merge locally persisted navigationStyle if present (backend may not persist this field)
      try {
        const local = await AsyncStorage.getItem(NAV_KEY)
        if (local) {
          ;(settings as any).navigationStyle = local as any
        }
      } catch (e) {
        // ignore
      }
      set({ settings, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      console.error('Failed to fetch settings:', error)
    }
  },

  updateSettings: async (updates: Partial<UserSettings>) => {
    set({ isLoading: true, error: null })
    try {
      const settings = await settingsApi.updateSettings(updates)
      // if navigationStyle provided, persist locally as backend may ignore it
      try {
        if (updates.navigationStyle) {
          await AsyncStorage.setItem(NAV_KEY, updates.navigationStyle)
          ;(settings as any).navigationStyle = updates.navigationStyle
        } else {
          const local = await AsyncStorage.getItem(NAV_KEY)
          if (local) (settings as any).navigationStyle = local as any
        }
      } catch (e) {
        // ignore
      }
      set({ settings, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      console.error('Failed to update settings:', error)
      throw error
    }
  },

  setSetting: (key, value) => {
    set((state) => ({
      settings: state.settings ? { ...state.settings, [key]: value } : state.settings,
    }))
    // persist navigationStyle locally
    if (key === 'navigationStyle') {
      try {
        AsyncStorage.setItem(NAV_KEY, String(value))
      } catch (e) {
        // ignore
      }
    }
  },
}))
