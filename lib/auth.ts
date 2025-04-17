import { jwtDecode } from "jwt-decode"

export interface GoogleUser {
  email: string
  name: string
  picture: string
  exp: number
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

// Store tokens in sessionStorage
export const storeTokens = (tokens: AuthTokens): void => {
  sessionStorage.setItem("specky_auth_tokens", JSON.stringify(tokens))
}

// Retrieve tokens from sessionStorage
export const getTokens = (): AuthTokens | null => {
  const tokensString = sessionStorage.getItem("specky_auth_tokens")
  if (!tokensString) return null
  return JSON.parse(tokensString)
}

// Clear tokens from sessionStorage
export const clearTokens = (): void => {
  sessionStorage.removeItem("specky_auth_tokens")
}

// Check if tokens are valid
export const isAuthenticated = (): boolean => {
  const tokens = getTokens()
  if (!tokens) return false
  return tokens.expiresAt > Date.now()
}

// Get user info from token
export const getUserInfo = (): GoogleUser | null => {
  const tokens = getTokens()
  if (!tokens) return null
  try {
    return jwtDecode<GoogleUser>(tokens.accessToken)
  } catch (error) {
    console.error("Failed to decode token:", error)
    return null
  }
}

// Refresh token if needed
export const refreshTokenIfNeeded = async (): Promise<boolean> => {
  const tokens = getTokens()
  if (!tokens) return false

  // If token is about to expire (within 5 minutes)
  if (tokens.expiresAt < Date.now() + 5 * 60 * 1000) {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      })

      if (!response.ok) throw new Error("Failed to refresh token")

      const newTokens = await response.json()
      storeTokens(newTokens)
      return true
    } catch (error) {
      console.error("Failed to refresh token:", error)
      clearTokens()
      return false
    }
  }

  return true
}
