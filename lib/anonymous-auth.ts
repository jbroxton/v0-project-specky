import { getSupabaseClient } from "@/lib/supabase"

/**
 * Sign in anonymously and create a session
 */
export async function signInAnonymously() {
  const supabase = getSupabaseClient()

  try {
    // Use the signInAnonymously method without any parameters
    const { data, error } = await supabase.auth.signInAnonymously()

    if (error) {
      console.error("Anonymous sign-in error:", error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
    }
  } catch (error) {
    console.error("Anonymous sign-in exception:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Check if the current user is an anonymous user
 */
export function isAnonymousUser(user: any) {
  // Anonymous users in Supabase don't have email addresses
  return user && !user.email
}

/**
 * Convert an anonymous user to a registered user
 */
export async function convertAnonymousToRegistered(email: string, password: string) {
  const supabase = getSupabaseClient()

  try {
    // Update the user with email and password
    const { data, error } = await supabase.auth.updateUser({
      email,
      password,
    })

    if (error) {
      console.error("Error converting anonymous user:", error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      user: data.user,
    }
  } catch (error) {
    console.error("Anonymous conversion exception:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
