import { create } from 'zustand'

type UiState = {
  showTabBar: boolean
  setShowTabBar: (v: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  showTabBar: true,
  setShowTabBar: (v) => set({ showTabBar: v }),
}))
