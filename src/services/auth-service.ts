import axios from 'axios'

export type Login = {
  university: string
  username: string
  password: string
}

export async function LoginService(data: Login) {
  try {
    const result = await axios.post<ApiResponse<AuthTokens>>('/api/token/', data)
    return result.data
  } catch (error) {
    return { success: false, message: 'Login failed', error }
  }
}

export async function RefreshTokenService(refresh: string): Promise<ApiResponse<AuthTokens>> {
  try {
    const result = await axios.post<ApiResponse<AuthTokens>>('/api/token/refresh/', {
      refresh,
    })

    return result.data
  } catch (error) {
    return { success: false, message: 'Token refresh failed', error }
  }
}
