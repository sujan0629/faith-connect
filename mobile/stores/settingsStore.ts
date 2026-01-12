import { create } from 'zustand'
import { settingsApi, UserSettings } from '../api/settings'

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
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: defaultSettings,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null })
    try {
      const settings = await settingsApi.getSettings()
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
  },
}))
