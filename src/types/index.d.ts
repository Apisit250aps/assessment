type ApiResponse<T = unknown> = {
  success: boolean
  message: string
  data?: T
  error?: unknown
}

type AuthTokens = {
  access_token: string
  refresh_token: string
}
