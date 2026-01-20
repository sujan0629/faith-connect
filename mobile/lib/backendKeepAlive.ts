import axios from 'axios'

/**
 * Keep-Alive Service for Backend
 * Prevents Render.com free tier from hibernating the backend
 * Render hibernates services after 15 minutes of inactivity
 * 
 * This service pings the health endpoint periodically to keep it warm
 */

let keepAliveInterval: NodeJS.Timeout | null = null
let isEnabled = false

const KEEP_ALIVE_INTERVAL = 5 * 60 * 1000 // 5 minutes (safer than 10 minutes)
const HEALTH_ENDPOINT = '/info' // Backend health check endpoint
const API_URL = 'https://faith-connect-4z69.onrender.com/api'

// Dedicated axios instance for keep-alive with shorter timeout
// This prevents blocking other requests if backend is cold
const keepAliveApi = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout for keep-alive pings
})

export const startBackendKeepAlive = () => {
  if (isEnabled) {
    console.log('[BackendKeepAlive] Already running')
    return
  }

  isEnabled = true
  console.log('[BackendKeepAlive] Started - pinging every 5 minutes')

  // Ping immediately on start
  pingBackend()

  // Then ping every 5 minutes
  keepAliveInterval = setInterval(() => {
    pingBackend()
  }, KEEP_ALIVE_INTERVAL)
}

export const stopBackendKeepAlive = () => {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval)
    keepAliveInterval = null
  }
  isEnabled = false
  console.log('[BackendKeepAlive] Stopped')
}

const pingBackend = async () => {
  try {
    console.log('[BackendKeepAlive] Pinging backend...')
    const startTime = Date.now()
    
    await keepAliveApi.get(HEALTH_ENDPOINT)
    
    const duration = Date.now() - startTime
    console.log(`[BackendKeepAlive] Ping successful (${duration}ms) - backend is warm`)
  } catch (error: any) {
    // Log but don't throw - keep-alive failures shouldn't crash the app
    console.warn('[BackendKeepAlive] Ping failed:', error?.message || error)
  }
}

export default {
  startBackendKeepAlive,
  stopBackendKeepAlive,
}
