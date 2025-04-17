"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Create a Supabase client for client-side usage
const supabase = createClientComponentClient()

/**
 * Sign in anonymously if the user is not already signed in
 * This creates a proper Supabase user with the anonymous flag set to true
 */
export async function ensureAnonymousUser() {
  try {
    // Check if user is already signed in
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If user is already signed in (anonymous or not), return
    if (session) {
      return { success: true, user: session.user }
    }

    // Sign in anonymously
    const { data, error } = await supabase.auth.signInAnonymously()

    if (error) {
      console.error("Error signing in anonymously:", error)
      return { success: false, error: error.message }
    }

    return { success: true, user: data.user }
  } catch (error) {
    console.error("Error in ensureAnonymousUser:", error)
    return { success: false, error: "Failed to sign in anonymously" }
  }
}

/**
 * Convert an anonymous user to a permanent user
 */
export async function convertAnonymousUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      email,
      password,
    })

    if (error) {
      console.error("Error converting anonymous user:", error)
      return { success: false, error: error.message }
    }

    return { success: true, user: data.user }
  } catch (error) {
    console.error("Error in convertAnonymousUser:", error)
    return { success: false, error: "Failed to convert anonymous user" }
  }
}
