import Cookies from 'js-cookie'

export const ACCESS_TOKEN_KEY = 'access_token'
export const REFRESH_TOKEN_KEY = 'refresh_token'

/**
 * Save access and refresh tokens to cookies
 */
export function setTokens(access: string, refresh: string) {
  Cookies.set(ACCESS_TOKEN_KEY, access, {
    expires: 7,
    secure: true,
    sameSite: 'Strict',
  })

  Cookies.set(REFRESH_TOKEN_KEY, refresh, {
    expires: 14,
    secure: true,
    sameSite: 'Strict',
  })
}

/**
 * Get access token from cookie
 */
export function getAccessToken(): string | undefined {
  return Cookies.get(ACCESS_TOKEN_KEY)
}

/**
 * Get refresh token from cookie
 */
export function getRefreshToken(): string | undefined {
  return Cookies.get(REFRESH_TOKEN_KEY)
}

/**
 * Remove both tokens from cookie
 */
export function clearTokens() {
  Cookies.remove(ACCESS_TOKEN_KEY)
  Cookies.remove(REFRESH_TOKEN_KEY)
}
