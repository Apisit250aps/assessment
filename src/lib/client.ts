import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestHeaders,
  type InternalAxiosRequestConfig,
} from 'axios'
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './token'
import { RefreshTokenService } from '@/services/auth-service'

type RetriableConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
  skipAuth?: boolean
  headers: AxiosRequestHeaders
}

const client: AxiosInstance = axios.create({})

let isRefreshing = false
let pendingQueue: Array<(token: string | null) => void> = []

function processQueue(newAccess: string | null) {
  pendingQueue.forEach((resolve) => resolve(newAccess))
  pendingQueue = []
}

client.interceptors.request.use(
  (config: RetriableConfig) => {
    if (!config.skipAuth) {
      const access = getAccessToken()
      if (access) config.headers.Authorization = `Bearer ${access}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig

    if (!error.response) return Promise.reject(error)

    const status = error.response.status
    const hasRefresh = !!getRefreshToken()

    if (status === 401 && !originalRequest._retry && hasRefresh) {
      originalRequest._retry = true

      if (isRefreshing) {
        const newAccess = await new Promise<string | null>((resolve) => {
          pendingQueue.push(resolve)
        })
        if (!newAccess) {
          clearTokens()
          return Promise.reject(error)
        }

        originalRequest.headers?.set?.('Authorization', `Bearer ${newAccess}`)
        return client(originalRequest)
      }

      isRefreshing = true
      try {
        const refresh = getRefreshToken()!

        const resp = await RefreshTokenService(refresh)

        const access = resp.data?.access_token ?? resp.data?.access_token
        const newRefresh = resp.data?.refresh_token ?? resp.data?.refresh_token ?? null

        if (!access) throw new Error('Refresh response missing access token')

        setTokens(access, newRefresh ?? refresh)

        processQueue(access)
        isRefreshing = false

        originalRequest.headers?.set?.('Authorization', `Bearer ${access}`)
        return client(originalRequest)
      } catch (refreshErr) {
        processQueue(null)
        isRefreshing = false
        clearTokens()
        return Promise.reject(refreshErr)
      }
    }
    return Promise.reject(error)
  },
)
