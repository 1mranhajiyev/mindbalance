import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/auth'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
})

function withTrailingSlash(url: string): string {
  const [path, query] = url.split('?')
  if (path.endsWith('/')) return url
  return query ? `${path}/?${query}` : `${path}/`
}

export function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && Array.isArray((data as { results?: T[] }).results)) {
    return (data as { results: T[] }).results
  }
  return []
}

function redirectToLogin() {
  if (typeof window === 'undefined') return
  const isAuthPage = window.location.pathname.startsWith('/login') ||
    window.location.pathname.startsWith('/register')
  if (!isAuthPage) {
    window.location.href = '/login'
  }
}

let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

function processQueue(token: string) {
  refreshQueue.forEach((callback) => callback(token))
  refreshQueue = []
}

function isAuthRequest(url?: string) {
  return !!url?.includes('/auth/')
}

api.interceptors.request.use((config) => {
  if (config.url) {
    config.url = withTrailingSlash(config.url)
  }
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === 'object' &&
      !Array.isArray(response.data) &&
      Array.isArray(response.data.results) &&
      ('count' in response.data || 'next' in response.data)
    ) {
      response.data = response.data.results
    }
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error)
    }

    const refresh = useAuthStore.getState().refreshToken

    if (!refresh || isAuthRequest(originalRequest.url)) {
      useAuthStore.getState().logout()
      redirectToLogin()
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          resolve(api(originalRequest))
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
      const res = await axios.post(`${baseURL}/auth/token/refresh/`, { refresh })
      const access = res.data.access as string
      const newRefresh = (res.data.refresh as string | undefined) ?? refresh

      useAuthStore.getState().setTokens(access, newRefresh)
      processQueue(access)

      originalRequest.headers.Authorization = `Bearer ${access}`
      return api(originalRequest)
    } catch {
      useAuthStore.getState().logout()
      redirectToLogin()
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  }
)

export default api
