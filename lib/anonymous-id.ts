/**
 * Utilities for handling anonymous users
 */

// Generate a unique anonymous ID for users who aren't logged in
export function generateAnonymousId(): string {
  // Create a random string with timestamp to ensure uniqueness
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 10)
  return `anon_${timestamp}_${randomStr}`
}

// Get the anonymous ID from localStorage or create a new one
export function getOrCreateAnonymousId(): string {
  if (typeof window === "undefined") {
    // Server-side rendering - generate a temporary ID
    // This will be replaced by the client-side ID when the page loads
    return generateAnonymousId()
  }

  let anonymousId = localStorage.getItem("specky_anonymous_id")

  if (!anonymousId) {
    anonymousId = generateAnonymousId()
    localStorage.setItem("specky_anonymous_id", anonymousId)
  }

  return anonymousId
}

// Set the anonymous ID in localStorage
export function setAnonymousId(id: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("specky_anonymous_id", id)
  }
}
