import { postsApi } from '../api/posts'
import { useOfflineStore, QueuedAction } from '../stores/offlineStore'

export class OfflineSyncService {
  static async syncQueuedActions(): Promise<void> {
    const { queue, removeFromQueue, incrementRetries, setSyncError, isSyncing } = useOfflineStore.getState()

    if (isSyncing || queue.length === 0) {
      return
    }

    useOfflineStore.setState({ isSyncing: true, syncError: null })

    for (const action of queue) {
      try {
        await this.processAction(action)
        removeFromQueue(action.id)
      } catch (error: any) {
        console.error(`Failed to sync action ${action.id}:`, error)
        incrementRetries(action.id)

        // Stop syncing if max retries exceeded
        if (action.retries >= 3) {
          removeFromQueue(action.id)
          setSyncError(`Failed to sync ${action.type} after 3 retries`)
        }
      }
    }

    useOfflineStore.setState({ isSyncing: false })
  }

  private static async processAction(action: QueuedAction): Promise<void> {
    switch (action.type) {
      case 'like':
        await postsApi.toggleLike(action.postId)
        break
      case 'save':
        await postsApi.toggleSave(action.postId)
        break
      case 'comment':
        await postsApi.addComment(action.postId, action.payload.text)
        break
      case 'repost':
        await postsApi.toggleRepost(action.postId)
        break
      default:
        throw new Error(`Unknown action type: ${action.type}`)
    }
  }
}

export default OfflineSyncService
