import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const API_URL = 'http://172.18.123.243:3000/api' 

export const api = axios.create({
	baseURL: API_URL,
	timeout: 30000, // 30 seconds for general requests
})

let accessToken: string | null = null
let isRefreshing = false
let failedQueue: Array<{
	resolve: (value?: unknown) => void
	reject: (reason?: any) => void
}> = []

const processQueue = (error: any = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error)
		} else {
			prom.resolve()
		}
	})
	failedQueue = []
}

export const setAccessToken = (token: string | null) => {
	accessToken = token
	if (token) {
		api.defaults.headers.common.Authorization = `Bearer ${token}`
	} else {
		delete api.defaults.headers.common.Authorization
	}
}

api.interceptors.request.use((config) => {
	if (accessToken) {
		config.headers = config.headers ?? {}
		;(config.headers as any).Authorization = `Bearer ${accessToken}`
	}
	return config
})

api.interceptors.response.use(
	(response: any) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

		// Handle 401 Unauthorized - implement token refresh
		if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
			if (isRefreshing) {
				// Queue the request while refresh is in progress
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject })
				})
					.then(() => {
						return api(originalRequest)
					})
					.catch((err) => {
						return Promise.reject(err)
					})
			}

			originalRequest._retry = true
			isRefreshing = true

			try {
				const { useAuthStore } = await import('../stores/authStore')
				const authState = useAuthStore.getState()
				const refreshToken = authState.refreshToken

				console.log('[Axios Interceptor] Attempting token refresh...')
				console.log('[Axios Interceptor] Refresh token available:', !!refreshToken)
				console.log('[Axios Interceptor] Auth state:', { 
					hasUser: !!authState.user, 
					hasAccessToken: !!authState.accessToken, 
					hasRefreshToken: !!refreshToken,
					isAuthenticated: authState.isAuthenticated 
				})

				if (!refreshToken) {
					throw new Error('No refresh token available')
				}

				// Call refresh endpoint
				const response = await axios.post(`${API_URL}/auth/refresh`, {
					refreshToken,
				})

				const { accessToken: newAccessToken, refreshToken: newRefreshToken, user } = response.data

				// Update tokens in store
				await useAuthStore.getState().setAuth({
					user,
					accessToken: newAccessToken,
					refreshToken: newRefreshToken,
				})

				// Update axios instance
				setAccessToken(newAccessToken)

				// Retry all queued requests
				processQueue(null)
				isRefreshing = false

				// Retry the original request
				originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
				return api(originalRequest)
			} catch (refreshError) {
				// Refresh failed - logout user
				processQueue(refreshError)
				isRefreshing = false

				const { useAuthStore } = await import('../stores/authStore')
				useAuthStore.getState().logout()

				return Promise.reject(refreshError)
			}
		}

		console.warn('API error', error?.response || error?.message)
		return Promise.reject(error)
	},
)
