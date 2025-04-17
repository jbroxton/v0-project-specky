import { refreshTokenIfNeeded, getTokens } from "./auth"

// Base function for making authenticated requests to Google APIs
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Ensure token is valid
  const isValid = await refreshTokenIfNeeded()
  if (!isValid) {
    throw new Error("Not authenticated")
  }

  const tokens = getTokens()
  if (!tokens) {
    throw new Error("No authentication tokens found")
  }

  // Add authorization header
  const headers = new Headers(options.headers)
  headers.set("Authorization", `Bearer ${tokens.accessToken}`)

  // Make the request
  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API request failed: ${error}`)
  }

  return response.json()
}

// Get list of recent documents
export async function getRecentDocs(maxResults = 10) {
  return fetchWithAuth(
    `https://www.googleapis.com/drive/v3/files?orderBy=modifiedTime desc&pageSize=${maxResults}&q=mimeType='application/vnd.google-apps.document'&fields=files(id,name,modifiedTime,thumbnailLink)`,
  )
}

// Search for documents
export async function searchDocs(query: string, maxResults = 10) {
  return fetchWithAuth(
    `https://www.googleapis.com/drive/v3/files?orderBy=modifiedTime desc&pageSize=${maxResults}&q=mimeType='application/vnd.google-apps.document' and fullText contains '${query}'&fields=files(id,name,modifiedTime,thumbnailLink)`,
  )
}

// Get document content
export async function getDocContent(docId: string) {
  return fetchWithAuth(`https://docs.googleapis.com/v1/documents/${docId}`)
}

// Get user profile
export async function getUserProfile() {
  return fetchWithAuth("https://www.googleapis.com/userinfo/v2/me")
}
