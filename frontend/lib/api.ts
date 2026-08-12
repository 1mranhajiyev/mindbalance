import axios from 'axios'
import { useAuthStore } from '@/store/auth'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
})

function withTrailingSlash(url: string): string {
  const [path, query] = url.split('?')
  if (path.endsWith('/')) return url
  return query ? `${path}/?${query}` : `${path}/`
}

api.interceptors.request.use((config) => {
  if (config.url) {
    config.url = withTrailingSlash(config.url)
  }
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
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/token/refresh/`, { refresh })
          useAuthStore.getState().setTokens(res.data.access, res.data.refresh)
          error.config.headers.Authorization = `Bearer ${res.data.access}`
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
