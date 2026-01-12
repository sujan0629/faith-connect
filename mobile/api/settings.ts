import { api } from './axios'

export interface UserSettings {
  notificationsEnabled: boolean
  emailNotificationsEnabled: boolean
  allowMessagesFromAnyone: boolean
  privateProfile: boolean
  allowComments: boolean
  whoCanLike: 'everyone' | 'followers' | 'none'
  blockedContentTopics: string[]
}

export const settingsApi = {
  // Get user settings
  getSettings: async (): Promise<UserSettings> => {
    const res = await api.get('/users/me/settings')
    return res.data
  },

  // Update user settings
  updateSettings: async (settings: Partial<UserSettings>): Promise<UserSettings> => {
    const res = await api.patch('/users/me/settings', settings)
    return res.data
  },
}
