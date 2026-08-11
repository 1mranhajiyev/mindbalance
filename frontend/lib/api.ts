import axios from 'axios'
import { useAuthStore } from '@/store/auth'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = useAuthStore.getState().refreshToken
      if (refresh) {
        try {
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, { refresh_token: refresh })
          useAuthStore.getState().setTokens(res.data.access_token, res.data.refresh_token)
          error.config.headers.Authorization = `Bearer ${res.data.access_token}`
          return api(error.config)
        } catch {
          useAuthStore.getState().logout()
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
