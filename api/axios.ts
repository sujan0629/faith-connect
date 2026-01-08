import axios from 'axios'

const API_URL = 'http://localhost:3000'

export const api = axios.create({
	baseURL: API_URL,
	timeout: 10000,
})

api.interceptors.response.use(
	(response: any) => response,
	(error: any) => {
		console.warn('API error', error?.response || error?.message)
		return Promise.reject(error)
	},
)
