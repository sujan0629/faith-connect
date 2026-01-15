import { io, Socket } from 'socket.io-client'
import { api } from '../api/axios'

let socket: Socket | null = null

const getBaseUrl = () => {
  const base = (api.defaults.baseURL as string) || ''
  return base.replace(/\/api\/?$/, '')
}

export function initSocket(token: string) {
  if (!token) return null
  if (socket && socket.connected) return socket

  const base = getBaseUrl()
  socket = io(base, {
    auth: { token },
    transports: ['websocket'],
    reconnectionAttempts: 5,
  })

  socket.on('connect_error', (err) => {
    console.warn('[Socket] connect_error', err)
  })

  socket.on('connect', () => {
    console.log('[Socket] connected', socket?.id)
  })

  socket.on('disconnect', (reason) => {
    console.log('[Socket] disconnected', reason)
  })

  return socket
}

export function getSocket() {
  return socket
}

export function disconnectSocket() {
  try {
    socket?.disconnect()
  } catch (e) {
    // ignore
  }
  socket = null
}

export default { initSocket, getSocket, disconnectSocket }
