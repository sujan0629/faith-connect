import { create } from 'zustand'

interface FollowStore {
  followingIds: Set<string>
  setFollowingIds: (ids: string[]) => void
  addFollowing: (leaderId: string) => void
  removeFollowing: (leaderId: string) => void
  isFollowing: (leaderId: string) => boolean
}

export const useFollowStore = create<FollowStore>((set, get) => ({
  followingIds: new Set(),
  
  setFollowingIds: (ids: string[]) => {
    set({ followingIds: new Set(ids) })
  },
  
  addFollowing: (leaderId: string) => {
    const current = get().followingIds
    set({ followingIds: new Set([...current, leaderId]) })
  },
  
  removeFollowing: (leaderId: string) => {
    const current = get().followingIds
    const updated = new Set(current)
    updated.delete(leaderId)
    set({ followingIds: updated })
  },
  
  isFollowing: (leaderId: string) => {
    return get().followingIds.has(leaderId)
  },
}))
